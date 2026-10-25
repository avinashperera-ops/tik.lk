'use server';

import { auth } from '@/auth';
import { db, TicketStatus } from '@open-ticket/database';
import { verifyDynamicQRToken } from '@open-ticket/crypto';
import { revalidatePath } from 'next/cache';

export interface ScanResult {
  status: 'VALID' | 'DUPLICATE' | 'EXPIRED' | 'INVALID_SIGNATURE' | 'NOT_FOUND';
  message: string;
  ticket?: {
    id: string;
    ownerName: string;
    tierName: string;
    eventTitle: string;
    checkedInAt?: Date;
  };
}

// Roles allowed to scan tickets. Keep in sync with ALLOWED_ROLES in committee/page.tsx
const SCANNER_ROLES = ['ORGANIZER'];

function displayName(owner: { firstName: string; lastName: string } | null | undefined) {
  if (!owner) return 'Attendee';
  const name = `${owner.firstName} ${owner.lastName}`.trim();
  return name && name !== '-' ? name : 'Attendee';
}

export async function validateGateScan(scannedPayload: string): Promise<ScanResult> {
  try {
    // 0. Only authorized staff may scan or check tickets in
    const session = await auth();
    if (!session?.user?.role || !SCANNER_ROLES.includes(session.user.role)) {
      return { status: 'INVALID_SIGNATURE', message: 'Not authorized to scan tickets.' };
    }

    const payload = typeof scannedPayload === 'string' ? scannedPayload.trim() : '';
    if (!payload) {
      return { status: 'INVALID_SIGNATURE', message: 'Empty scan.' };
    }

    let resolvedTicketId: string | null = null;

    // 1. Verify dynamic HMAC/TOTP signature
    const cryptoResult = verifyDynamicQRToken(payload, 30);

    if (cryptoResult.valid && cryptoResult.ticketId) {
      resolvedTicketId = cryptoResult.ticketId;
    } else {
      console.warn('[validateGateScan] Dynamic check failed:', cryptoResult.reason);

      // Fallback: match the stored signed payload. Matching a raw ticket ID
      // is only allowed outside production (handy for manual testing).
      const directTicket = await db.ticket.findFirst({
        where: {
          OR: [
            { qrPayload: payload },
            ...(process.env.NODE_ENV !== 'production' ? [{ id: payload }] : []),
          ],
        },
        select: { id: true },
      });

      if (directTicket) {
        resolvedTicketId = directTicket.id;
      }
    }

    if (!resolvedTicketId) {
      if (!cryptoResult.valid && cryptoResult.reason === 'EXPIRED_QR_CODE') {
        return {
          status: 'EXPIRED',
          message: 'QR Code Expired. Attendees must use live app, not screenshots.',
        };
      }
      return {
        status: 'INVALID_SIGNATURE',
        message: 'INVALID CRYPTOGRAPHIC SIGNATURE. FORGED PASS.',
      };
    }

    // 2. Fetch ticket details
    const ticket = await db.ticket.findUnique({
      where: { id: resolvedTicketId },
      include: {
        owner: true,
        tier: true,
        event: true,
      },
    });

    if (!ticket) {
      return { status: 'NOT_FOUND', message: 'Ticket Record Not Found' };
    }

    const ticketInfo = {
      id: ticket.id,
      ownerName: displayName(ticket.owner),
      tierName: ticket.tier.name,
      eventTitle: ticket.event.title,
    };

    // 3. Already checked in
    if (ticket.status === TicketStatus.CHECKED_IN) {
      return {
        status: 'DUPLICATE',
        message: 'ALREADY CHECKED IN!',
        ticket: ticketInfo,
      };
    }

    // 4. Only paid tickets may enter (not reserved, available, cancelled, etc.)
    if (ticket.status !== TicketStatus.PAID) {
      return {
        status: 'NOT_FOUND',
        message: `Ticket is not valid for entry (status: ${ticket.status}).`,
        ticket: ticketInfo,
      };
    }

    // 5. Claim the check-in atomically. If two scanners hit the same ticket
    // at the same moment, only one update matches and the other is a duplicate.
    const claimed = await db.ticket.updateMany({
      where: { id: ticket.id, status: TicketStatus.PAID },
      data: { status: TicketStatus.CHECKED_IN },
    });

    if (claimed.count === 0) {
      return {
        status: 'DUPLICATE',
        message: 'ALREADY CHECKED IN!',
        ticket: ticketInfo,
      };
    }

    revalidatePath('/committee');

    return {
      status: 'VALID',
      message: 'ACCESS GRANTED',
      ticket: ticketInfo,
    };
  } catch (error) {
    console.error('Gate Processing Error:', error);
    return { status: 'INVALID_SIGNATURE', message: 'Gate Processing Error' };
  }
}
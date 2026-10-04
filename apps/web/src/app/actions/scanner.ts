'use server';

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

export async function validateGateScan(scannedPayload: string): Promise<ScanResult> {
  try {
    console.log('[validateGateScan] Received payload:', scannedPayload);

    let resolvedTicketId: string | null = null;

    // 1. Verify dynamic HMAC signature
    const cryptoResult = verifyDynamicQRToken(scannedPayload, 30);

    if (cryptoResult.valid && cryptoResult.ticketId) {
      resolvedTicketId = cryptoResult.ticketId;
    } else {
      console.warn('[validateGateScan] Dynamic TOTP check failed:', cryptoResult.reason);

      // Fallback: Check if payload matches direct ticket.id or stored qrPayload
      const directTicket = await db.ticket.findFirst({
        where: {
          OR: [
            { id: scannedPayload },
            { qrPayload: scannedPayload },
          ],
        },
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

    // 2. Fetch ticket details from Neon DB
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

    // 3. Prevent duplicate check-ins
    if (ticket.status === TicketStatus.CHECKED_IN) {
      return {
        status: 'DUPLICATE',
        message: 'ALREADY CHECKED IN!',
        ticket: {
          id: ticket.id,
          ownerName: ticket.owner?.fullName || 'Attendee',
          tierName: ticket.tier.name,
          eventTitle: ticket.event.title,
        },
      };
    }

    // 4. Update status in Neon DB
    const updatedTicket = await db.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.CHECKED_IN },
    });

    revalidatePath('/committee');

    return {
      status: 'VALID',
      message: 'ACCESS GRANTED',
      ticket: {
        id: updatedTicket.id,
        ownerName: ticket.owner?.fullName || 'Attendee',
        tierName: ticket.tier.name,
        eventTitle: ticket.event.title,
      },
    };
  } catch (error) {
    console.error('Gate Processing Error:', error);
    return { status: 'INVALID_SIGNATURE', message: 'Gate Processing Error' };
  }
}
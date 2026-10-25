'use server';

import { db, TicketStatus } from '@open-ticket/database';
import { generateDynamicQRToken } from '@open-ticket/crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function issueDemoTicket(formData: FormData) {
  // Demo helper: it hands out free PAID tickets, so it must never run in production.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo ticket issuing is disabled in production.');
  }

  const tierId = formData.get('tierId');
  const eventId = formData.get('eventId');

  if (typeof tierId !== 'string' || typeof eventId !== 'string' || !tierId || !eventId) {
    throw new Error('Missing tierId or eventId in form submission');
  }

  try {
    // 0. Make sure the tier really belongs to the event
    const tier = await db.ticketTier.findUnique({
      where: { id: tierId },
      select: { eventId: true },
    });
    if (!tier || tier.eventId !== eventId) {
      throw new Error('Ticket tier not found for this event.');
    }

    // 1. Fetch or create owner user
    // NOTE: this mirrors the dashboard, which also loads the first user.
    // Replace both with the signed-in session user when auth is wired up.
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'attendee@openticket.io',
          firstName: 'Avinash',
          lastName: 'Perera',
          role: 'BUYER',
        },
      });
    }

    // 2. Create actual database ticket record
    const ticket = await db.ticket.create({
      data: {
        eventId,
        tierId,
        ownerId: user.id,
        status: TicketStatus.PAID,
      },
    });

    // 3. Generate initial TOTP HMAC token for this ticket
    const initialToken = generateDynamicQRToken(ticket.id);

    // 4. Save initial token payload
    await db.ticket.update({
      where: { id: ticket.id },
      data: { qrPayload: initialToken },
    });

    // 5. Purge server and client cache across buyer and committee routes
    revalidatePath('/dashboard', 'page');
    revalidatePath('/committee', 'page');
  } catch (error) {
    console.error('Failed to issue ticket:', error);
    throw error;
  }

  // MUST BE OUTSIDE TRY...CATCH so Next.js can trigger the HTTP 307 redirect
  redirect('/dashboard');
}
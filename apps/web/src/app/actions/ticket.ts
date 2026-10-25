'use server';

import { auth } from '@/auth';
import { db, TicketStatus } from '@open-ticket/database';
import { generateDynamicQRToken } from '@open-ticket/crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function issueDemoTicket(formData: FormData) {
  // Demo helper: it hands out free PAID tickets, so it must never run in production.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo ticket issuing is disabled in production.');
  }

  // The ticket belongs to whoever is signed in
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) {
    redirect('/login');
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

    // 1. Find the signed-in user's database record
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User account not found.');
    }

    // 2. Create the ticket record
    const ticket = await db.ticket.create({
      data: {
        eventId,
        tierId,
        ownerId: user.id,
        status: TicketStatus.PAID,
      },
    });

    // 3. Generate the initial TOTP HMAC token for this ticket
    const initialToken = generateDynamicQRToken(ticket.id);

    // 4. Save the initial token payload
    await db.ticket.update({
      where: { id: ticket.id },
      data: { qrPayload: initialToken },
    });

    // 5. Purge cached pages
    revalidatePath('/dashboard', 'page');
    revalidatePath('/committee', 'page');
  } catch (error) {
    console.error('Failed to issue ticket:', error);
    throw error;
  }

  // MUST BE OUTSIDE TRY...CATCH so Next.js can trigger the redirect
  redirect('/dashboard');
}
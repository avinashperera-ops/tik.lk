'use server';

import { db, TicketStatus } from '@open-ticket/database';
import { generateDynamicQRToken } from '@open-ticket/crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function issueDemoTicket(formData: FormData) {
  const tierId = formData.get('tierId') as string;
  const eventId = formData.get('eventId') as string;

  if (!tierId || !eventId) {
    throw new Error('Missing tierId or eventId in form submission');
  }

  try {
    // 1. Fetch or create owner user
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'attendee@openticket.io',
          fullName: 'T.A.I.C. Avinash Perera',
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
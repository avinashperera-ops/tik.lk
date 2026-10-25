'use server';

import { db } from '@open-ticket/database';
import { generateSignedTicketPayload } from '@open-ticket/crypto';
import { revalidatePath } from 'next/cache';

export interface PurchaseTicketInput {
  eventId: string;
  tierId: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
}

export async function processTicketPurchase(input: PurchaseTicketInput) {
  try {
    const { tierId, buyerName, quantity } = input;
    const buyerEmail = input.buyerEmail.trim().toLowerCase();

    // 0. Validate input
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { success: false, error: 'Invalid quantity.' };
    }
    if (!buyerEmail || !buyerName?.trim()) {
      return { success: false, error: 'Name and email are required.' };
    }

    // 1. Fetch tier + event (trust the tier's event, not the client's eventId)
    const tier = await db.ticketTier.findUnique({
      where: { id: tierId },
      include: { event: { select: { id: true, slug: true } } },
    });

    if (!tier) {
      return { success: false, error: 'Ticket tier not found.' };
    }
    if (tier.eventId !== input.eventId) {
      return { success: false, error: 'Tier does not belong to this event.' };
    }
    if (quantity > tier.maxPerUser) {
      return { success: false, error: `Maximum ${tier.maxPerUser} tickets per order.` };
    }

    const eventId = tier.eventId;

    // 2. Find or create buyer
    let user = await db.user.findUnique({ where: { email: buyerEmail } });

    if (!user) {
      const [firstName, ...rest] = buyerName.trim().split(/\s+/);
      user = await db.user.create({
        data: {
          email: buyerEmail,
          firstName,
          lastName: rest.join(' ') || '-',
          role: 'BUYER',
        },
      });
    }

    const buyer = user;

    // 3. Reserve inventory and create tickets atomically
    const createdTickets = await db.$transaction(
      async (tx) => {
        // Conditional decrement: only succeeds if enough stock remains.
        // This closes the race where two buyers pass the check at once.
        const reserved = await tx.ticketTier.updateMany({
          where: { id: tierId, availableCount: { gte: quantity } },
          data: { availableCount: { decrement: quantity } },
        });

        if (reserved.count === 0) {
          throw new Error('SOLD_OUT');
        }

        const tickets = [];

        for (let i = 0; i < quantity; i++) {
          const tempId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const newTicket = await tx.ticket.create({
            data: {
              eventId,
              tierId,
              ownerId: buyer.id,
              qrPayload: generateSignedTicketPayload({
                ticketId: tempId,
                eventId,
                tierId,
                ownerId: buyer.id,
              }),
              status: 'RESERVED',
            },
          });

          // Re-sign with the real database ID
          const updatedTicket = await tx.ticket.update({
            where: { id: newTicket.id },
            data: {
              qrPayload: generateSignedTicketPayload({
                ticketId: newTicket.id,
                eventId,
                tierId,
                ownerId: buyer.id,
              }),
            },
          });

          tickets.push(updatedTicket);
        }

        return tickets;
      },
      { timeout: 15000 }
    );

    revalidatePath('/dashboard');
    revalidatePath(`/events/${tier.event.slug}`);

    return { success: true, count: createdTickets.length };
  } catch (error) {
    if (error instanceof Error && error.message === 'SOLD_OUT') {
      return { success: false, error: 'Not enough tickets available.' };
    }
    console.error('Purchase Error:', error);
    return { success: false, error: 'Transaction failed. Please try again.' };
  }
}
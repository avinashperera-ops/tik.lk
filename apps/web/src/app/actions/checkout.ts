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
    const { eventId, tierId, buyerName, buyerEmail, quantity } = input;

    // 1. Fetch Tier & Validate Capacity
    const tier = await db.ticketTier.findUnique({
      where: { id: tierId },
    });

    if (!tier) {
      return { success: false, error: 'Ticket tier not found.' };
    }

    if (tier.quantityAvailable < quantity) {
      return { success: false, error: 'Not enough tickets available.' };
    }

    // 2. Find or Create Buyer User
    let user = await db.user.findUnique({
      where: { email: buyerEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: buyerEmail,
          name: buyerName,
          role: 'BUYER',
        },
      });
    }

    // 3. Create Ticket Records & Update Inventory inside transaction
    const createdTickets = await db.$transaction(async (tx) => {
      // Decrement available capacity
      await tx.ticketTier.update({
        where: { id: tierId },
        data: {
          quantityAvailable: { decrement: quantity },
        },
      });

      const tickets = [];

      for (let i = 0; i < quantity; i++) {
        // Dummy ticket ID created for initial payload signature
        const ticketIdTemp = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        const signedHmac = generateSignedTicketPayload({
          ticketId: ticketIdTemp,
          eventId,
          tierId,
          ownerId: user.id,
        });

        const newTicket = await tx.ticket.create({
          data: {
            eventId,
            tierId,
            ownerId: user.id,
            signedHmacPayload: signedHmac,
            status: 'ISSUED',
          },
        });

        // Re-sign with actual database primary key ID
        const finalSignedHmac = generateSignedTicketPayload({
          ticketId: newTicket.id,
          eventId,
          tierId,
          ownerId: user.id,
        });

        const updatedTicket = await tx.ticket.update({
          where: { id: newTicket.id },
          data: { signedHmacPayload: finalSignedHmac },
        });

        tickets.push(updatedTicket);
      }

      return tickets;
    });

    revalidatePath('/dashboard');
    revalidatePath(`/events/${eventId}`);

    return { success: true, count: createdTickets.length };
  } catch (error) {
    console.error('Purchase Error:', error);
    return { success: false, error: 'Transaction failed. Please try again.' };
  }
}
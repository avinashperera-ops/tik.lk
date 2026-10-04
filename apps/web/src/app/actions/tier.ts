'use server';

import { db } from '@open-ticket/database';

export interface CreateTicketTierInput {
  eventId: string;
  name: string;
  description?: string;
  priceInCents: number;
  totalCapacity: number;
}

export async function createTicketTier(input: CreateTicketTierInput) {
  try {
    const tier = await db.ticketTier.create({
      data: {
        eventId: input.eventId,
        name: input.name,
        description: input.description,
        priceInCents: input.priceInCents,
        totalCapacity: input.totalCapacity,
        availableCount: input.totalCapacity,
      },
    });

    return { success: true, tier };
  } catch (error: any) {
    console.error('Failed to create ticket tier:', error);
    return { success: false, error: error?.message || 'Could not create ticket tier.' };
  }
}
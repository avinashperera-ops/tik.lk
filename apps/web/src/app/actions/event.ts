'use server';

import { db } from '@open-ticket/database';

export interface CreateEventInput {
  organizationId: string;
  title: string;
  slug: string;
  description: string;
  venueName: string;
  venueAddress: string;
  startDate: Date;
  endDate: Date;
}

export async function createEvent(input: CreateEventInput) {
  try {
    let org = await db.organization.findFirst();
    if (!org) {
      org = await db.organization.create({
        data: {
          name: 'Default Organization',
          slug: 'default-org',
        },
      });
    }

    const event = await db.event.create({
      data: {
        organizationId: org.id,
        title: input.title,
        slug: input.slug,
        description: input.description,
        venueName: input.venueName,
        venueAddress: input.venueAddress,
        startDate: input.startDate,
        endDate: input.endDate,
        isPublished: true,
      },
    });

    return { success: true, event };
  } catch (error: any) {
    console.error('Failed to create event:', error);
    return { success: false, error: error?.message || 'Could not create event.' };
  }
}
'use server';

import { db, TicketStatus } from '@open-ticket/database';
import { verifyDynamicQRToken } from '@open-ticket/crypto';

export async function processTurnstileScan(
  scannedPayload: string,
  scannedById: string,
  zoneId: string
) {
  const cryptoResult = verifyDynamicQRToken(scannedPayload, 30);
  if (!cryptoResult.valid || !cryptoResult.ticketId) {
    return { status: 'DENIED', reason: cryptoResult.reason || 'INVALID_SIGNATURE' };
  }

  const ticket = await db.ticket.findUnique({
    where: { id: cryptoResult.ticketId },
    include: { event: true },
  });

  if (!ticket) return { status: 'DENIED', reason: 'TICKET_NOT_FOUND' };

  if (ticket.status === TicketStatus.CHECKED_IN) {
    await db.gateLog.create({
      data: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        zoneId,
        scannedById,
        scanResult: 'DUPLICATE',
        failureReason: 'ALREADY_CHECKED_IN',
      },
    });
    return { status: 'DENIED', reason: 'DUPLICATE_ENTRY' };
  }

  await db.$transaction([
    db.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.CHECKED_IN },
    }),
    db.gateLog.create({
      data: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        zoneId,
        scannedById,
        scanResult: 'SUCCESS',
      },
    }),
  ]);

  return { status: 'GRANTED', ticketId: ticket.id };
}
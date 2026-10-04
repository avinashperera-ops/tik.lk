import { db } from '@open-ticket/database';

export async function calculateDynamicPrice(tierId: string): Promise<number> {
  const tier = await db.ticketTier.findUnique({
    where: { id: tierId },
    include: { pricingRules: true },
  });

  if (!tier) throw new Error('Tier not found');

  let currentPrice = tier.priceInCents;
  const now = new Date();
  const soldPercent = ((tier.totalCapacity - tier.availableCount) / tier.totalCapacity) * 100;

  for (const rule of tier.pricingRules) {
    if (rule.ruleType === 'TIME_BASED' && rule.triggerTime && now >= rule.triggerTime) {
      if (rule.adjustedPrice > currentPrice) currentPrice = rule.adjustedPrice;
    }
    if (rule.ruleType === 'CAPACITY_BASED' && rule.triggerPercent && soldPercent >= rule.triggerPercent) {
      if (rule.adjustedPrice > currentPrice) currentPrice = rule.adjustedPrice;
    }
  }

  return currentPrice;
}

export async function reserveSeatWithLock(eventId: string, seatId: string, durationMinutes = 10) {
  const expiration = new Date(Date.now() + durationMinutes * 60 * 1000);

  return await db.$transaction(async (tx) => {
    const seat = await tx.seat.findUnique({ where: { id: seatId } });
    if (!seat || (seat.isReserved && seat.reservedAt && seat.reservedAt > new Date())) {
      throw new Error('Seat is currently locked by another user');
    }

    return await tx.seat.update({
      where: { id: seatId },
      data: { isReserved: true, reservedAt: expiration },
    });
  });
}
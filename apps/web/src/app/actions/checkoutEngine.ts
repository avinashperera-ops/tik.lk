'use server';

import { db } from '@open-ticket/database';
import { calculateDynamicPrice } from './pricingEngine';

export interface ExtendedCheckoutInput {
  eventId: string;
  tierId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  quantity: number;
  promoCode?: string;
  seatId?: string;
  metadata?: Record<string, any>;
  paymentMethod: 'CREDIT_CARD' | 'INSTANT_PAYMENT' | 'CASH';
}

export async function processAdvancedCheckout(input: ExtendedCheckoutInput) {
  const basePrice = await calculateDynamicPrice(input.tierId);
  let finalUnitPrice = basePrice;

  if (input.promoCode) {
    const discount = await db.discountRule.findUnique({
      where: { eventId_code: { eventId: input.eventId, code: input.promoCode } },
    });
    if (discount && discount.currentUses < (discount.maxUses || Infinity)) {
      if (discount.discountType === 'PERCENTAGE') {
        finalUnitPrice -= Math.floor((basePrice * discount.value) / 100);
      } else {
        finalUnitPrice = Math.max(0, finalUnitPrice - discount.value);
      }
    }
  }

  const totalAmount = finalUnitPrice * input.quantity;
  const platformFee = Math.floor(totalAmount * 0.05); // 5% Platform commission

  return await db.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: input.buyerEmail } });
    if (!user) {
      user = await tx.user.create({
        data: {
          email: input.buyerEmail,
          fullName: input.buyerName,
          phoneNumber: input.buyerPhone,
        },
      });
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        amountInCents: totalAmount,
        platformFee,
        currency: 'USD',
        gateway: 'STRIPE_CONNECT',
        gatewayTxId: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        paymentMethod: input.paymentMethod,
        status: 'COMPLETED',
      },
    });

    const tickets = [];
    for (let i = 0; i < input.quantity; i++) {
      const ticket = await tx.ticket.create({
        data: {
          eventId: input.eventId,
          tierId: input.tierId,
          ownerId: user.id,
          seatId: input.seatId,
          transactionId: transaction.id,
          status: 'PAID',
          metadata: input.metadata || {},
        },
      });
      tickets.push(ticket);
    }

    await tx.ticketTier.update({
      where: { id: input.tierId },
      data: { availableCount: { decrement: input.quantity } },
    });

    return { success: true, transactionId: transaction.id, tickets };
  });
}
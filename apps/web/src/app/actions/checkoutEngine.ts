'use server';

import { db } from '@open-ticket/database';
import { generateSignedTicketPayload } from '@open-ticket/crypto';
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
  try {
    const buyerEmail = input.buyerEmail?.trim().toLowerCase();
    const buyerName = input.buyerName?.trim();

    // 0. Validate input
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      return { success: false as const, error: 'Invalid quantity.' };
    }
    if (!buyerEmail || !buyerName) {
      return { success: false as const, error: 'Name and email are required.' };
    }

    // 1. Validate tier belongs to the event and respects per-order limit
    const tier = await db.ticketTier.findUnique({ where: { id: input.tierId } });
    if (!tier || tier.eventId !== input.eventId) {
      return { success: false as const, error: 'Ticket tier not found for this event.' };
    }
    if (input.quantity > tier.maxPerUser) {
      return {
        success: false as const,
        error: `Maximum ${tier.maxPerUser} tickets per order.`,
      };
    }
    if (tier.availableCount < input.quantity) {
      return { success: false as const, error: 'Not enough tickets available.' };
    }

    // 2. Pricing
    const basePrice = await calculateDynamicPrice(input.tierId);
    let finalUnitPrice = basePrice;
    let appliedDiscountId: string | null = null;

    if (input.promoCode) {
      const discount = await db.discountRule.findUnique({
        where: { eventId_code: { eventId: input.eventId, code: input.promoCode } },
      });
      if (discount && discount.currentUses < (discount.maxUses || Infinity)) {
        appliedDiscountId = discount.id;
        if (discount.discountType === 'PERCENTAGE') {
          finalUnitPrice -= Math.floor((basePrice * discount.value) / 100);
        } else {
          finalUnitPrice = Math.max(0, finalUnitPrice - discount.value);
        }
      }
    }

    const totalAmount = finalUnitPrice * input.quantity;
    const platformFee = Math.floor(totalAmount * 0.05); // 5% platform commission

    // 3. Everything below succeeds or fails together
    const result = await db.$transaction(
      async (tx) => {
        // Reserve stock atomically: only succeeds if enough remains
        const reserved = await tx.ticketTier.updateMany({
          where: { id: input.tierId, availableCount: { gte: input.quantity } },
          data: { availableCount: { decrement: input.quantity } },
        });
        if (reserved.count === 0) {
          throw new Error('SOLD_OUT');
        }

        // Count the promo use (only if a limit still allows it)
        if (appliedDiscountId) {
          const discountRow = await tx.discountRule.findUnique({
            where: { id: appliedDiscountId },
          });
          if (discountRow?.maxUses != null) {
            const used = await tx.discountRule.updateMany({
              where: { id: appliedDiscountId, currentUses: { lt: discountRow.maxUses } },
              data: { currentUses: { increment: 1 } },
            });
            if (used.count === 0) {
              throw new Error('PROMO_EXHAUSTED');
            }
          } else {
            await tx.discountRule.update({
              where: { id: appliedDiscountId },
              data: { currentUses: { increment: 1 } },
            });
          }
        }

        // Find or create buyer
        let user = await tx.user.findUnique({ where: { email: buyerEmail } });
        if (!user) {
          const [firstName, ...rest] = buyerName.split(/\s+/);
          user = await tx.user.create({
            data: {
              email: buyerEmail,
              firstName,
              lastName: rest.join(' ') || '-',
              phoneNumber: input.buyerPhone?.trim() || null,
              role: 'BUYER',
            },
          });
        }
        const buyer = user;

        const transaction = await tx.transaction.create({
          data: {
            userId: buyer.id,
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
          const tempId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const created = await tx.ticket.create({
            data: {
              eventId: input.eventId,
              tierId: input.tierId,
              ownerId: buyer.id,
              seatId: input.seatId,
              transactionId: transaction.id,
              status: 'PAID',
              metadata: input.metadata || {},
              qrPayload: generateSignedTicketPayload({
                ticketId: tempId,
                eventId: input.eventId,
                tierId: input.tierId,
                ownerId: buyer.id,
              }),
            },
          });

          // Re-sign with the real database ID so the QR code verifies
          const signed = await tx.ticket.update({
            where: { id: created.id },
            data: {
              qrPayload: generateSignedTicketPayload({
                ticketId: created.id,
                eventId: input.eventId,
                tierId: input.tierId,
                ownerId: buyer.id,
              }),
            },
          });

          tickets.push(signed);
        }

        return { transactionId: transaction.id, tickets };
      },
      { timeout: 15000 }
    );

    return { success: true as const, ...result };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'SOLD_OUT') {
        return { success: false as const, error: 'Not enough tickets available.' };
      }
      if (error.message === 'PROMO_EXHAUSTED') {
        return { success: false as const, error: 'This promo code has been fully redeemed.' };
      }
    }
    console.error('Checkout Error:', error);
    return { success: false as const, error: 'Checkout failed. Please try again.' };
  }
}
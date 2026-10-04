import crypto from 'crypto';

const SYSTEM_SECRET = process.env.HMAC_SECRET || 'fallback-secret-change-in-production-32chars!';

export interface TicketSignaturePayload {
  ticketId: string;
  eventId: string;
  tierId: string;
  ownerId: string;
}

/**
 * Mints a cryptographically signed HMAC payload for a ticket.
 */
export function generateSignedTicketPayload(payload: TicketSignaturePayload): string {
  const { ticketId, eventId, tierId, ownerId } = payload;
  const rawData = `${ticketId}:${eventId}:${tierId}:${ownerId}`;
  
  const signature = crypto
    .createHmac('sha256', SYSTEM_SECRET)
    .update(rawData)
    .digest('hex');

  // Format: ticketId.eventId.tierId.ownerId.signature
  return `${ticketId}.${eventId}.${tierId}.${ownerId}.${signature}`;
}

/**
 * Validates the HMAC signature on the scanner side.
 */
export function verifySignedTicketPayload(qrString: string): {
  valid: boolean;
  ticketId?: string;
  eventId?: string;
  reason?: string;
} {
  const parts = qrString.split('.');
  if (parts.length !== 5) {
    return { valid: false, reason: 'MALFORMED_PAYLOAD' };
  }

  const [ticketId, eventId, tierId, ownerId, signature] = parts;
  const rawData = `${ticketId}:${eventId}:${tierId}:${ownerId}`;

  const expectedSignature = crypto
    .createHmac('sha256', SYSTEM_SECRET)
    .update(rawData)
    .digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  if (!isSignatureValid) {
    return { valid: false, reason: 'INVALID_SIGNATURE' };
  }

  return { valid: true, ticketId, eventId };
}
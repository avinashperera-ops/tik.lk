import crypto from 'crypto';
import QRCode from 'qrcode';
import { generateSignedTicketPayload, verifySignedTicketPayload } from './hmac';

/**
 * Generates a dynamic, time-decaying QR token (refreshes every 30 seconds).
 */
export function generateDynamicQRToken(signedPayload: string, windowSeconds = 30): string {
  const timeStep = Math.floor(Date.now() / 1000 / windowSeconds);
  const rawString = `${signedPayload}:${timeStep}`;
  
  const timeHash = crypto
    .createHash('sha256')
    .update(rawString)
    .digest('hex')
    .substring(0, 8); // 8-character rolling token

  return `${signedPayload}:${timeHash}`;
}

/**
 * Validates dynamic QR token including signature and time window drift allowance.
 */
export function verifyDynamicQRToken(
  dynamicTokenString: string,
  windowSeconds = 30
): { valid: boolean; ticketId?: string; reason?: string } {
  const lastColonIndex = dynamicTokenString.lastIndexOf(':');
  if (lastColonIndex === -1) {
    return { valid: false, reason: 'INVALID_DYNAMIC_FORMAT' };
  }

  const signedPayload = dynamicTokenString.substring(0, lastColonIndex);
  const receivedHash = dynamicTokenString.substring(lastColonIndex + 1);

  // 1. Verify underlying HMAC
  const hmacVerification = verifySignedTicketPayload(signedPayload);
  if (!hmacVerification.valid) {
    return hmacVerification;
  }

  // 2. Verify Time Window (Allow +-1 window for clock drift)
  const currentTimeStep = Math.floor(Date.now() / 1000 / windowSeconds);
  const validSteps = [currentTimeStep - 1, currentTimeStep, currentTimeStep + 1];

  const isValidTime = validSteps.some((step) => {
    const expectedHash = crypto
      .createHash('sha256')
      .update(`${signedPayload}:${step}`)
      .digest('hex')
      .substring(0, 8);
    return expectedHash === receivedHash;
  });

  if (!isValidTime) {
    return { valid: false, reason: 'EXPIRED_QR_CODE' };
  }

  return { valid: true, ticketId: hmacVerification.ticketId };
}

/**
 * Converts any QR payload string into a high-density Base64 Data URI for rendering in UI.
 */
export async function renderQRDataURI(payload: string): Promise<string> {
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
}
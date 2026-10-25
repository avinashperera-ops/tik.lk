export interface TicketSignaturePayload {
    ticketId: string;
    eventId: string;
    tierId: string;
    ownerId: string;
}
/**
 * Mints a cryptographically signed HMAC payload for a ticket.
 */
export declare function generateSignedTicketPayload(payload: TicketSignaturePayload): string;
/**
 * Validates the HMAC signature on the scanner side.
 */
export declare function verifySignedTicketPayload(qrString: string): {
    valid: boolean;
    ticketId?: string;
    eventId?: string;
    reason?: string;
};
//# sourceMappingURL=hmac.d.ts.map
/**
 * Generates a dynamic, time-decaying QR token (refreshes every 30 seconds).
 */
export declare function generateDynamicQRToken(signedPayload: string, windowSeconds?: number): string;
/**
 * Validates dynamic QR token including signature and time window drift allowance.
 */
export declare function verifyDynamicQRToken(dynamicTokenString: string, windowSeconds?: number): {
    valid: boolean;
    ticketId?: string;
    reason?: string;
};
/**
 * Converts any QR payload string into a high-density Base64 Data URI for rendering in UI.
 */
export declare function renderQRDataURI(payload: string): Promise<string>;
//# sourceMappingURL=dynamicQr.d.ts.map
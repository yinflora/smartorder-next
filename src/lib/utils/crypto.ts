/**
 * Crypto utilities for table hash validation
 * Used for QR code link security
 */

/**
 * Generate a server-side hash (without user agent dependency)
 * Used for generating QR codes on backend
 */
export function generateServerTableHash(tableNo: string, shopId: string): string {
  const date = new Date().toISOString().split('T')[0];
  const raw = `smartorder-${shopId}-${date}-${tableNo}`;
  return Buffer.from(raw).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-12);
}

/**
 * Validate server-side hash
 * Used for verifying QR code links
 */
export function validateServerTableHash(tableNo: string, shopId: string, hash: string): boolean {
  return generateServerTableHash(tableNo, shopId) === hash;
}

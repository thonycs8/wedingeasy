/**
 * Encode role + guest + optional side into a compact opaque token for invite URLs.
 * Format: base64("role|guest") or base64("role|guest|side") — minimal overhead.
 */

export function encodeInviteToken(role: string, guest: string, side?: string): string {
  const payload = side ? `${role}|${guest}|${side}` : `${role}|${guest}`;
  return btoa(payload);
}

export function decodeInviteToken(token: string): { role: string; guest: string; side?: string } | null {
  try {
    const decoded = atob(token);
    const parts = decoded.split("|");
    if (parts.length < 2) return null;
    return {
      role: parts[0],
      guest: parts[1],
      side: parts[2] || undefined,
    };
  } catch {
    return null;
  }
}

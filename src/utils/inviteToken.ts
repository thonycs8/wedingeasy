/**
 * Encode role + guest into a compact opaque token for invite URLs.
 * Format: base64("role|guest") — minimal overhead.
 */

export function encodeInviteToken(role: string, guest: string): string {
  return btoa(`${role}|${guest}`);
}

export function decodeInviteToken(token: string): { role: string; guest: string } | null {
  try {
    const decoded = atob(token);
    const sep = decoded.indexOf("|");
    if (sep === -1) return null;
    return { role: decoded.slice(0, sep), guest: decoded.slice(sep + 1) };
  } catch {
    return null;
  }
}

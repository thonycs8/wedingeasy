/**
 * Encode role + guest into an opaque base64 token for invite URLs.
 * Keeps the URL clean without exposing role/guest names.
 */

export function encodeInviteToken(role: string, guest: string): string {
  const payload = JSON.stringify({ r: role, g: guest });
  return btoa(unescape(encodeURIComponent(payload)));
}

export function decodeInviteToken(token: string): { role: string; guest: string } | null {
  try {
    const json = decodeURIComponent(escape(atob(token)));
    const parsed = JSON.parse(json);
    if (parsed.r && parsed.g) {
      return { role: parsed.r, guest: parsed.g };
    }
    return null;
  } catch {
    return null;
  }
}

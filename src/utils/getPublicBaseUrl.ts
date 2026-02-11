/**
 * Returns the public base URL for event links.
 * Uses the published custom domain when available,
 * falls back to window.location.origin for local dev.
 */
export function getPublicBaseUrl(): string {
  const publishedUrl = import.meta.env.VITE_PUBLIC_URL;
  if (publishedUrl) return publishedUrl.replace(/\/+$/, "");
  return window.location.origin;
}

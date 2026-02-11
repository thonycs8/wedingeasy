/**
 * Global cache populated by usePlatformUrl() hook.
 */
let _cachedPlatformUrl: string | null = null;

export function setPlatformUrl(url: string) {
  _cachedPlatformUrl = url.replace(/\/+$/, "");
}

/**
 * Returns the public base URL for event links.
 * Priority: DB platform_settings > VITE_PUBLIC_URL > window.location.origin
 */
export function getPublicBaseUrl(): string {
  if (_cachedPlatformUrl) return _cachedPlatformUrl;
  const publishedUrl = import.meta.env.VITE_PUBLIC_URL;
  if (publishedUrl) return publishedUrl.replace(/\/+$/, "");
  return window.location.origin;
}

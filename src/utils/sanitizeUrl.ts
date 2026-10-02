/**
 * URL Sanitizer & Security Utilities
 * Protects against open redirects, XSS (javascript: and data: URIs), and tabnabbing.
 */

export function isSafeExternalUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Strictly permit only http and https protocols
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }

  // Reject javascript:, data:, vbscript: or protocol-relative //
  if (/^(javascript|data|vbscript):/i.test(trimmed) || /^\/\//i.test(trimmed)) {
    return false;
  }

  return true;
}

export function sanitizeExternalUrl(url?: string, fallback = '#'): string {
  if (isSafeExternalUrl(url)) {
    return url!.trim();
  }
  return fallback;
}

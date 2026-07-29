/**
 * Rewrites Open Graph and Twitter card URL/image tags in the SPA's
 * index.html so self-hosted instances expose their own URL in shared
 * link previews instead of the Cloud Tuple defaults.
 *
 * Only the leading `https://app.tuple.ai` is replaced, preserving
 * any path suffix on `og:image` (e.g. `/og-image.png`). When `baseUrl`
 * is empty or matches the default, the input is returned unchanged.
 */
const DEFAULT_BASE = 'https://app.tuple.ai';

export function rewriteOgTags(html: string, baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed || trimmed === DEFAULT_BASE) return html;
  return html.split(DEFAULT_BASE).join(trimmed);
}

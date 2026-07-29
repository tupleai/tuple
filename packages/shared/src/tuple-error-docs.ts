/**
 * Public documentation for Tuple's own error codes (`M001`, `M100`, …).
 *
 * The code catalogue itself lives backend-side in
 * `packages/backend/src/common/errors/error-codes.ts` — only the docs base URL
 * is shared, because the dashboard renders a "read the docs" link from the
 * `error_code` persisted on a message row and must not re-declare the URL.
 */
export const TUPLE_ERRORS_DOCS_BASE = 'https://tuple.ai/docs/errors';

/** Deep link to the documentation page for one Tuple error code. */
export function tupleErrorDocsUrl(code: string): string {
  return `${TUPLE_ERRORS_DOCS_BASE}/${code}`;
}

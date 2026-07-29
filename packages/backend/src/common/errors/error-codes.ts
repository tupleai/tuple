import { TUPLE_ERRORS_DOCS_BASE } from 'tuple-shared';

export { TUPLE_ERRORS_DOCS_BASE };

const ROUTING_MARK = '↗';

export const TUPLE_ERRORS = {
  M001: {
    title: 'Missing Authorization header',
    template: 'Missing the Authorization header. Set it to "Bearer tuple_<your-key>".',
  },
  M002: {
    title: 'Empty Bearer token',
    template: 'The Bearer token is empty. Paste your Tuple key into it.',
  },
  M003: {
    title: 'Invalid key format',
    template:
      'That doesn\'t look right. Tuple keys start with "tuple_". Grab yours from the dashboard.',
  },
  M004: {
    title: 'Key expired',
    template: 'This key has expired. Generate a new one here',
  },
  M005: {
    title: 'Key not recognized',
    template:
      "I don't recognize this key. It might have been rotated or deleted. Grab the current one from the dashboard.",
  },
  M100: {
    title: 'Provider API key missing',
    template: 'No {provider} API key yet. Add one here: {dashboardUrl}',
  },
  M101: {
    title: 'No providers configured',
    template: "You're connected, but no providers are set up yet. Add one here: {dashboardUrl}",
  },
  M102: {
    title: 'Provider subscription credentials unusable',
    template:
      '{provider} subscription credentials could not be refreshed. Reconnect OAuth here: {dashboardUrl}',
  },
  M200: {
    title: 'Usage limit exceeded',
    template:
      'You hit your {metric} limit: {used} used, {threshold}/{period} allowed. Adjust it here: {dashboardUrl}',
  },
  M201: {
    title: 'Per-user rate limit exceeded',
    template: 'Too many requests — wait a few seconds and retry.',
  },
  M202: {
    title: 'Per-IP rate limit exceeded',
    template: 'Too many requests from this IP — wait a few seconds and retry.',
  },
  M203: {
    title: 'Concurrency limit exceeded',
    template: 'Too many concurrent requests. Give it a moment.',
  },
  M204: {
    title: 'Monthly request limit reached',
    template:
      "You've used all {threshold} requests included this month on the Free plan. " +
      'Upgrade to Pro for unlimited requests: {upgradeUrl}',
  },
  M300: {
    title: 'Missing messages array',
    template: '`messages` array is required.',
  },
  M302: {
    title: 'Model not available',
    template:
      'Model "{model}" is not available for this agent. Use GET /v1/models to list available model IDs, or make the provider available for this agent here: {dashboardUrl}',
  },
  M303: {
    title: 'Local provider unavailable on Tuple Cloud',
    template:
      'Built-in local providers are only available in self-hosted Tuple. On Tuple Cloud, expose the runtime through a public URL or tunnel and connect it as a custom provider.',
  },
  M500: {
    title: 'Internal server error',
    template: 'Something broke on our end. Try again in a moment.',
  },
} as const;

export type TupleErrorCode = keyof typeof TUPLE_ERRORS;

// Matches the Tuple prefix written by formatTupleError, e.g. `[↗ Tuple M102]`.
// The ↗ is REQUIRED: only Tuple emits it, so a provider error body that merely
// echoes the text "Tuple M100" can never be mis-extracted into a Tuple code
// (which would then misclassify a provider round-trip as a Tuple config error).
const TUPLE_ERROR_CODE_RE = /\[\s*↗\s*Tuple\s+(M\d{3})\s*\]/;

export function formatTupleError(
  code: TupleErrorCode,
  vars: Record<string, string | number> = {},
): string {
  const entry = TUPLE_ERRORS[code];
  const interpolated = entry.template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
  return `[${ROUTING_MARK} Tuple ${code}] ${interpolated} See ${TUPLE_ERRORS_DOCS_BASE}/${code}`;
}

/**
 * Pull a registered Tuple error code out of a rendered message or JSON body
 * that embeds one (provider-attempt rows store the branded text in
 * error_message but need error_code for filters/analytics).
 */
export function extractTupleErrorCode(
  text: string | null | undefined,
): TupleErrorCode | null {
  if (!text) return null;
  const match = text.match(TUPLE_ERROR_CODE_RE);
  if (!match) return null;
  const code = match[1] as TupleErrorCode;
  return code in TUPLE_ERRORS ? code : null;
}

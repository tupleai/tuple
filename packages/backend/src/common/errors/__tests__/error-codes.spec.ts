import {
  extractTupleErrorCode,
  formatTupleError,
  TUPLE_ERRORS,
  TUPLE_ERRORS_DOCS_BASE,
  TupleErrorCode,
} from '../error-codes';

describe('TUPLE_ERRORS registry', () => {
  it('exposes the public docs base URL', () => {
    expect(TUPLE_ERRORS_DOCS_BASE).toBe('https://tuple.ai/docs/errors');
  });

  it('every code has a non-empty title and template', () => {
    for (const [code, entry] of Object.entries(TUPLE_ERRORS)) {
      expect(entry.title).toBeTruthy();
      expect(entry.template).toBeTruthy();
      expect(code).toMatch(/^M\d{3}$/);
    }
  });

  it('every code is unique', () => {
    const codes = Object.keys(TUPLE_ERRORS);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('formatTupleError', () => {
  it('wraps a static template with the Tuple prefix and docs URL', () => {
    const out = formatTupleError('M001');
    expect(out).toContain('[↗ Tuple M001]');
    expect(out).toContain('Missing the Authorization header');
    expect(out).toContain('https://tuple.ai/docs/errors/M001');
  });

  it('interpolates {var} placeholders from the vars object', () => {
    const out = formatTupleError('M100', {
      provider: 'anthropic',
      dashboardUrl: 'https://dash.example/x',
    });
    expect(out).toContain('No anthropic API key yet');
    expect(out).toContain('https://dash.example/x');
    expect(out).not.toContain('{provider}');
    expect(out).not.toContain('{dashboardUrl}');
  });

  it('leaves placeholders untouched when a var is missing', () => {
    const out = formatTupleError('M100', { provider: 'openai' });
    expect(out).toContain('No openai API key yet');
    expect(out).toContain('{dashboardUrl}');
  });

  it('renders M102 for unusable subscription credentials', () => {
    const out = formatTupleError('M102', {
      provider: 'openai',
      dashboardUrl: 'https://dash.example/routing',
    });
    expect(out).toContain('[↗ Tuple M102]');
    expect(out).toContain('openai subscription credentials could not be refreshed');
    expect(out).toContain('https://dash.example/routing');
  });

  it('appends the docs URL exactly once', () => {
    const out = formatTupleError('M500');
    const matches = out.match(/https:\/\/tuple\.ai\/docs\/errors\/M500/g) ?? [];
    expect(matches).toHaveLength(1);
  });

  it('produces a stable output for every registered code', () => {
    for (const code of Object.keys(TUPLE_ERRORS) as TupleErrorCode[]) {
      const out = formatTupleError(code);
      expect(out.startsWith(`[↗ Tuple ${code}]`)).toBe(true);
      expect(out.endsWith(`See ${TUPLE_ERRORS_DOCS_BASE}/${code}`)).toBe(true);
    }
  });
});

describe('extractTupleErrorCode', () => {
  it('returns null for empty or non-Tuple text', () => {
    expect(extractTupleErrorCode(null)).toBeNull();
    expect(extractTupleErrorCode(undefined)).toBeNull();
    expect(extractTupleErrorCode('')).toBeNull();
    expect(extractTupleErrorCode('upstream 500')).toBeNull();
    expect(extractTupleErrorCode('[Tuple M999] unknown')).toBeNull();
    // A provider body that echoes the code text without the routing mark must NOT
    // be mistaken for a Tuple error (guards against provider-error mislabeling).
    expect(extractTupleErrorCode('[Tuple M100] echoed by an upstream')).toBeNull();
    expect(extractTupleErrorCode('provider said: Tuple M102 somewhere')).toBeNull();
  });

  it('extracts the code from a formatted Tuple message', () => {
    expect(extractTupleErrorCode(formatTupleError('M102', { provider: 'openai' }))).toBe(
      'M102',
    );
    expect(
      extractTupleErrorCode('[↗ Tuple M100] No openai API key yet. Add one here: https://x'),
    ).toBe('M100');
  });

  it('finds the code when nested inside a JSON error body', () => {
    const body = JSON.stringify({
      error: {
        message: formatTupleError('M102', {
          provider: 'openai',
          dashboardUrl: 'https://dash/routing',
        }),
      },
    });
    expect(extractTupleErrorCode(body)).toBe('M102');
  });

  it('round-trips every registered code', () => {
    for (const code of Object.keys(TUPLE_ERRORS) as TupleErrorCode[]) {
      expect(extractTupleErrorCode(formatTupleError(code))).toBe(code);
    }
  });
});

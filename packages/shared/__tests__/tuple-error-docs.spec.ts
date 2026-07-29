import { TUPLE_ERRORS_DOCS_BASE, tupleErrorDocsUrl } from '../src/tuple-error-docs';

describe('tuple error docs', () => {
  it('points at the public error documentation', () => {
    expect(TUPLE_ERRORS_DOCS_BASE).toBe('https://tuple.ai/docs/errors');
  });

  it('deep links a code to its own page', () => {
    expect(tupleErrorDocsUrl('M100')).toBe('https://tuple.ai/docs/errors/M100');
    expect(tupleErrorDocsUrl('M300')).toBe('https://tuple.ai/docs/errors/M300');
  });
});

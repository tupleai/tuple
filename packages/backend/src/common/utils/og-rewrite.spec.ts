import { rewriteOgTags } from './og-rewrite';

const SAMPLE_HTML = `<!doctype html>
<html>
  <head>
    <meta property="og:url" content="https://app.tuple.ai" />
    <meta property="og:image" content="https://app.tuple.ai/og-image.png" />
    <meta name="twitter:image" content="https://app.tuple.ai/og-image.png" />
  </head>
</html>`;

describe('rewriteOgTags', () => {
  it('returns the input unchanged when baseUrl is empty', () => {
    expect(rewriteOgTags(SAMPLE_HTML, '')).toBe(SAMPLE_HTML);
  });

  it('returns the input unchanged when baseUrl matches the default', () => {
    expect(rewriteOgTags(SAMPLE_HTML, 'https://app.tuple.ai')).toBe(SAMPLE_HTML);
  });

  it('returns the input unchanged when baseUrl matches the default with a trailing slash', () => {
    expect(rewriteOgTags(SAMPLE_HTML, 'https://app.tuple.ai/')).toBe(SAMPLE_HTML);
  });

  it('rewrites all occurrences of the default base to the custom base', () => {
    const result = rewriteOgTags(SAMPLE_HTML, 'https://tuple.example.com');
    expect(result).toContain('content="https://tuple.example.com"');
    expect(result).toContain('content="https://tuple.example.com/og-image.png"');
    expect(result).not.toContain('https://app.tuple.ai');
  });

  it('strips trailing slashes from the custom base', () => {
    const result = rewriteOgTags(SAMPLE_HTML, 'https://tuple.example.com//');
    expect(result).toContain('content="https://tuple.example.com"');
    expect(result).toContain('content="https://tuple.example.com/og-image.png"');
  });

  it('preserves the og:image path suffix', () => {
    const result = rewriteOgTags(SAMPLE_HTML, 'http://localhost:3001');
    expect(result).toContain('content="http://localhost:3001/og-image.png"');
  });

  it('handles a string with no occurrences gracefully', () => {
    expect(rewriteOgTags('<html></html>', 'https://tuple.example.com')).toBe('<html></html>');
  });

  it('trims whitespace from baseUrl', () => {
    const result = rewriteOgTags(SAMPLE_HTML, '  https://tuple.example.com  ');
    expect(result).toContain('content="https://tuple.example.com"');
  });
});

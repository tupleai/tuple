import { describe, expect, it } from '@jest/globals';
import { isTupleUsableProvider, isSupportedSubscriptionProvider } from './subscription-support';

describe('subscription-support helpers', () => {
  it('recognizes canonical subscription provider ids', () => {
    expect(isSupportedSubscriptionProvider('gemini')).toBe(true);
    expect(isTupleUsableProvider({ provider: 'gemini', auth_type: 'subscription' })).toBe(true);
  });

  it('recognizes subscription provider aliases', () => {
    expect(isSupportedSubscriptionProvider('google')).toBe(true);
    expect(isTupleUsableProvider({ provider: 'google', auth_type: 'subscription' })).toBe(true);
  });

  it('keeps non-subscription auth records usable regardless of provider support', () => {
    expect(isTupleUsableProvider({ provider: 'deepseek', auth_type: 'api_key' })).toBe(true);
    expect(isTupleUsableProvider({ provider: 'deepseek', auth_type: null })).toBe(true);
  });

  it('rejects unsupported subscription providers', () => {
    expect(isSupportedSubscriptionProvider('deepseek')).toBe(false);
    expect(isTupleUsableProvider({ provider: 'deepseek', auth_type: 'subscription' })).toBe(
      false,
    );
  });
});

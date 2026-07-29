import type { AuthType } from 'tuple-shared';
import { supportsSubscriptionProvider } from 'tuple-shared';

type ProviderAuthRecord = {
  provider: string;
  auth_type?: AuthType | null;
};

export function isSupportedSubscriptionProvider(provider: string): boolean {
  return supportsSubscriptionProvider(provider);
}

export function isTupleUsableProvider(record: ProviderAuthRecord): boolean {
  return record.auth_type !== 'subscription' || isSupportedSubscriptionProvider(record.provider);
}

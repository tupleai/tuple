import { render } from '@react-email/render';
import {
  PlanUsageEmail,
  PlanUsageEmailProps,
  SubscriptionPlanEmail,
  SubscriptionPlanEmailProps,
} from './emails/billing-plan-email';
import { sendEmail } from '../notifications/services/email-providers/send-email';

export function formatPlanName(plan: string | null | undefined): string {
  const normalized = (plan ?? '').trim().toLowerCase();
  if (normalized === 'pro') return 'Pro';
  if (normalized === 'free') return 'Free';
  if (!normalized) return 'Tuple';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getBillingEmailFrom(explicit?: string | null): string {
  return (
    explicit ||
    process.env['EMAIL_FROM'] ||
    process.env['NOTIFICATION_FROM_EMAIL'] ||
    'noreply@tuple.ai'
  );
}

function normalizeAppUrl(appUrl: string): string {
  return appUrl.replace(/\/+$/, '') || 'https://app.tuple.ai';
}

export function getBillingAppUrl(explicit?: string | null): string {
  return normalizeAppUrl(
    explicit || process.env['BETTER_AUTH_URL'] || 'https://app.tuple.ai',
  );
}

export function subscriptionEmailSubject(kind: SubscriptionPlanEmailProps['kind'], plan: string) {
  if (kind === 'plan_changed') return `Your Tuple plan changed to ${plan}`;
  if (kind === 'cancellation_confirmed') return `Your Tuple ${plan} cancellation is scheduled`;
  return `Your Tuple ${plan} plan is active`;
}

export function usageEmailSubject(kind: PlanUsageEmailProps['kind']) {
  return kind === 'requests_limit_reached'
    ? 'Your Tuple monthly request limit has been reached'
    : 'Your Tuple workspace has used 80% of monthly requests';
}

export async function sendSubscriptionPlanEmail(
  to: string,
  props: SubscriptionPlanEmailProps,
  fromEmail?: string | null,
): Promise<boolean> {
  const element = SubscriptionPlanEmail(props);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return sendEmail({
    to,
    subject: subscriptionEmailSubject(props.kind, props.planName),
    html,
    text,
    from: `Tuple <${getBillingEmailFrom(fromEmail)}>`,
  });
}

export async function sendPlanUsageEmail(
  to: string,
  props: PlanUsageEmailProps,
  fromEmail?: string | null,
): Promise<boolean> {
  const element = PlanUsageEmail(props);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  return sendEmail({
    to,
    subject: usageEmailSubject(props.kind),
    html,
    text,
    from: `Tuple <${getBillingEmailFrom(fromEmail)}>`,
  });
}

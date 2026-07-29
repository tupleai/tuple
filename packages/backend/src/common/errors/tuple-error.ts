import { HttpException } from '@nestjs/common';
import { formatTupleError, TUPLE_ERRORS, type TupleErrorCode } from './error-codes';

/**
 * `routing_reason` values the proxy stamps on a Tuple-originated row. Each
 * one classifies to an `{ error_origin, error_class }` pair via
 * `classifyMessageError` in `tuple-shared` — the two lists are kept in
 * lock-step by `__tests__/tuple-error.spec.ts`.
 */
export const TUPLE_BLOCKED_REQUEST_REASONS = [
  'no_provider',
  'no_provider_key',
  'subscription_credentials_unusable',
  'key_expired',
  'limit_exceeded',
  'plan_request_limit_exceeded',
  'tuple_rate_limited',
  'tuple_ip_rate_limited',
  'tuple_concurrency_limited',
  'tuple_invalid_request',
  'local_provider_unavailable',
  'model_not_available',
  'tuple_internal_error',
] as const;
export type TupleBlockedRequestReason = (typeof TUPLE_BLOCKED_REQUEST_REASONS)[number];

/**
 * Error codes that can never become an `agent_messages` row: they are raised by
 * `AgentKeyAuthGuard` before a key resolves to a tenant, so there is no agent to
 * attribute the row to. Recording them anyway would let anyone holding the
 * endpoint URL write rows into someone else's dashboard by guessing keys.
 *
 * `M004` (expired key) is deliberately NOT here — that key does resolve to an
 * agent, so its rejection is recordable.
 */
export const UNRECORDABLE_TUPLE_CODES = ['M001', 'M002', 'M003', 'M005'] as const;
export type UnrecordableTupleCode = (typeof UNRECORDABLE_TUPLE_CODES)[number];

/** A documented Tuple error that can be attributed to an agent, and so recorded. */
export type RecordableTupleCode = Exclude<TupleErrorCode, UnrecordableTupleCode>;

/**
 * The one mapping from a documented error code to the reason persisted on its
 * message row. Adding a code to `TUPLE_ERRORS` without adding it here (or to
 * `UNRECORDABLE_TUPLE_CODES`) fails the guardrail spec.
 */
export const TUPLE_CODE_TO_REASON: Record<RecordableTupleCode, TupleBlockedRequestReason> =
  {
    M004: 'key_expired',
    M100: 'no_provider_key',
    M101: 'no_provider',
    M102: 'subscription_credentials_unusable',
    M200: 'limit_exceeded',
    M201: 'tuple_rate_limited',
    M202: 'tuple_ip_rate_limited',
    M203: 'tuple_concurrency_limited',
    M204: 'plan_request_limit_exceeded',
    M300: 'tuple_invalid_request',
    M302: 'model_not_available',
    M303: 'local_provider_unavailable',
    M500: 'tuple_internal_error',
  };

export function isRecordableTupleCode(code: TupleErrorCode): code is RecordableTupleCode {
  return !(UNRECORDABLE_TUPLE_CODES as readonly string[]).includes(code);
}

/**
 * An error Tuple itself raised, carrying the documented code that identifies
 * it. Throwing this instead of a bare `HttpException` is what lets the proxy
 * tell "Tuple rejected the request" from "the provider returned a 4xx" —
 * before this existed, a `BadRequestException` for a malformed body was recorded
 * as a provider error and counted against provider reliability.
 */
export class TupleError extends HttpException {
  constructor(
    readonly code: TupleErrorCode,
    status: number,
    vars: Record<string, string | number> = {},
  ) {
    super(formatTupleError(code, vars), status);
  }

  /** Human title from the catalogue, e.g. "Missing messages array". */
  get title(): string {
    return TUPLE_ERRORS[this.code].title;
  }
}

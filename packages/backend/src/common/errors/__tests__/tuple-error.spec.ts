import { HttpStatus } from '@nestjs/common';
import { classifyMessageError, TUPLE_ERROR_ORIGINS } from 'tuple-shared';
import { TUPLE_ERRORS, type TupleErrorCode } from '../error-codes';
import {
  TUPLE_BLOCKED_REQUEST_REASONS,
  TUPLE_CODE_TO_REASON,
  TupleError,
  UNRECORDABLE_TUPLE_CODES,
  isRecordableTupleCode,
} from '../tuple-error';

describe('TupleError', () => {
  it('renders the documented message and keeps the code queryable', () => {
    const err = new TupleError('M300', HttpStatus.BAD_REQUEST);

    expect(err.code).toBe('M300');
    expect(err.getStatus()).toBe(400);
    expect(err.message).toContain('[↗ Tuple M300]');
    expect(err.message).toContain('`messages` array is required.');
    expect(err.title).toBe('Missing messages array');
  });

  it('interpolates template variables', () => {
    const err = new TupleError('M100', HttpStatus.OK, {
      provider: 'anthropic',
      dashboardUrl: 'https://app.example/routing',
    });

    expect(err.message).toContain('No anthropic API key yet');
    expect(err.message).toContain('https://app.example/routing');
  });
});

describe('every documented error code is accounted for', () => {
  const allCodes = Object.keys(TUPLE_ERRORS) as TupleErrorCode[];

  // The guardrail: a new M### either maps to a recorder reason or is explicitly
  // declared unrecordable. Neither is a silent option.
  it.each(allCodes)('%s is either recordable or explicitly unrecordable', (code) => {
    const recordable = isRecordableTupleCode(code);
    const declaredUnrecordable = (UNRECORDABLE_TUPLE_CODES as readonly string[]).includes(code);

    expect(recordable || declaredUnrecordable).toBe(true);
    if (recordable) {
      expect(TUPLE_CODE_TO_REASON[code]).toBeDefined();
    }
  });

  it('only the pre-authentication auth failures are unrecordable', () => {
    expect(UNRECORDABLE_TUPLE_CODES).toEqual(['M001', 'M002', 'M003', 'M005']);
    // M004 resolves an agent before rejecting, so it must stay recordable.
    expect(isRecordableTupleCode('M004')).toBe(true);
  });

  it('maps every recordable code onto a declared reason', () => {
    for (const reason of Object.values(TUPLE_CODE_TO_REASON)) {
      expect(TUPLE_BLOCKED_REQUEST_REASONS).toContain(reason);
    }
  });

  it('classifies every reason as a Tuple origin, never a provider fault', () => {
    for (const reason of TUPLE_BLOCKED_REQUEST_REASONS) {
      const { error_origin, error_class } = classifyMessageError({
        status: 'error',
        routingReason: reason,
      });

      expect(error_origin).not.toBeNull();
      expect(TUPLE_ERROR_ORIGINS).toContain(error_origin!);
      expect(error_class).not.toBeNull();
    }
  });

  it('puts a malformed caller body on the request origin, not config or provider', () => {
    const { error_origin, error_class } = classifyMessageError({
      status: 'error',
      errorHttpStatus: 400,
      routingReason: TUPLE_CODE_TO_REASON.M300,
    });

    expect(error_origin).toBe('request');
    expect(error_class).toBe('invalid_request');
  });

  it('puts an unavailable explicit model on the request origin, not config', () => {
    const { error_origin, error_class } = classifyMessageError({
      status: 'error',
      routingReason: TUPLE_CODE_TO_REASON.M302,
    });

    expect(error_origin).toBe('request');
    expect(error_class).toBe('not_found');
  });

  it('puts a cloud-inaccessible local provider on the config origin', () => {
    const { error_origin, error_class } = classifyMessageError({
      status: 'error',
      routingReason: TUPLE_CODE_TO_REASON.M303,
    });

    expect(error_origin).toBe('config');
    expect(error_class).toBe('local_provider_unavailable');
  });

  it('keeps a Tuple internal error off the provider reliability signal', () => {
    const { error_origin } = classifyMessageError({
      status: 'error',
      errorHttpStatus: 500,
      routingReason: TUPLE_CODE_TO_REASON.M500,
    });

    expect(error_origin).toBe('internal');
  });

  it('separates the three rate limits instead of collapsing them', () => {
    expect(TUPLE_CODE_TO_REASON.M201).toBe('tuple_rate_limited');
    expect(TUPLE_CODE_TO_REASON.M202).toBe('tuple_ip_rate_limited');
    expect(TUPLE_CODE_TO_REASON.M203).toBe('tuple_concurrency_limited');

    const reasons = [
      TUPLE_CODE_TO_REASON.M201,
      TUPLE_CODE_TO_REASON.M202,
      TUPLE_CODE_TO_REASON.M203,
    ];
    expect(new Set(reasons).size).toBe(3);
    for (const reason of reasons) {
      expect(classifyMessageError({ status: 'rate_limited', routingReason: reason })).toMatchObject(
        {
          error_origin: 'policy',
          error_class: 'rate_limit',
        },
      );
    }
  });

  it('classifies an expired key as a setup problem, not a provider auth failure', () => {
    const { error_origin, error_class } = classifyMessageError({
      status: 'error',
      errorHttpStatus: 401,
      routingReason: TUPLE_CODE_TO_REASON.M004,
    });

    expect(error_origin).toBe('config');
    expect(error_class).toBe('auth');
  });
});

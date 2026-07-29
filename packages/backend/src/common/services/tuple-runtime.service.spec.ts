import { ConfigService } from '@nestjs/config';
import { TupleRuntimeService } from './tuple-runtime.service';

describe('TupleRuntimeService', () => {
  it('returns configured auth base URL when present', () => {
    const config = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: unknown) =>
          key === 'app.betterAuthUrl' ? 'https://auth.example.com' : defaultValue,
        ),
    } as unknown as ConfigService;

    const service = new TupleRuntimeService(config);

    expect(service.getAuthBaseUrl()).toBe('https://auth.example.com');
  });

  it('falls back to localhost auth base URL using app.port', () => {
    const config = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === 'app.betterAuthUrl') return '';
        if (key === 'app.port') return 4010;
        return defaultValue;
      }),
    } as unknown as ConfigService;

    const service = new TupleRuntimeService(config);

    expect(service.getAuthBaseUrl()).toBe('http://localhost:4010');
  });
});

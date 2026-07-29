import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TupleRuntimeService {
  constructor(private readonly config: ConfigService) {}

  getAuthBaseUrl(): string {
    const configuredBaseUrl = this.config.get<string>('app.betterAuthUrl', '');
    if (configuredBaseUrl) return configuredBaseUrl;

    const port = this.config.get<number>('app.port', 3001);
    return `http://localhost:${port}`;
  }
}

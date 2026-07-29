import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant.entity';
import { Agent } from '../entities/agent.entity';
import { IngestEventBusService } from './services/ingest-event-bus.service';
import { TupleRuntimeService } from './services/tuple-runtime.service';
import { TenantCacheService } from './services/tenant-cache.service';
import { UserCacheInterceptor } from './interceptors/user-cache.interceptor';
import { AgentCacheInterceptor } from './interceptors/agent-cache.interceptor';
import { AgentRecordingCacheService } from './services/agent-recording-cache.service';
import { RequestRecordingStorageService } from './services/request-recording-storage.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Agent])],
  providers: [
    IngestEventBusService,
    TupleRuntimeService,
    TenantCacheService,
    UserCacheInterceptor,
    AgentCacheInterceptor,
    AgentRecordingCacheService,
    RequestRecordingStorageService,
  ],
  exports: [
    IngestEventBusService,
    TupleRuntimeService,
    TenantCacheService,
    UserCacheInterceptor,
    AgentCacheInterceptor,
    AgentRecordingCacheService,
    RequestRecordingStorageService,
  ],
})
export class CommonModule {}

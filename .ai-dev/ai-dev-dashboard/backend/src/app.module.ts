import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { BoardModule } from './board/board.module';
import { HealthModule } from './health/health.module';
import { EpicsModule } from './epics/epics.module';
import { StoriesModule } from './stories/stories.module';
import { BugsModule } from './bugs/bugs.module';
import { SprintsModule } from './sprints/sprints.module';
import { BurstsModule } from './bursts/bursts.module';
import { ProgressModule } from './progress/progress.module';
import { DocumentsModule } from './documents/documents.module';
import { CLIModule } from './cli/cli.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    BoardModule,
    HealthModule,
    EpicsModule,
    StoriesModule,
    BugsModule,
    SprintsModule,
    BurstsModule,
    ProgressModule,
    DocumentsModule,
    ClientsModule,
    CLIModule,
  ],
})
export class AppModule { }

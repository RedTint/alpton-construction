import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { EpicsModule } from '../epics/epics.module';
import { StoriesModule } from '../stories/stories.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [ConfigModule, EpicsModule, StoriesModule, CommonModule],
  controllers: [BoardController],
  providers: [BoardService],
  exports: [BoardService],
})
export class BoardModule {}

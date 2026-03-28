import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BoardService } from './board.service';
import { BoardData, Metrics, Release, Story } from './board.types';

@ApiTags('board')
@Controller('api')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('board')
  @ApiOperation({ summary: 'Get full board data' })
  getBoardData(): Promise<BoardData> {
    return this.boardService.getBoardData();
  }

  @Get('stories')
  @ApiOperation({ summary: 'Get stories with optional filters' })
  @ApiQuery({ name: 'version', required: false, description: 'Filter by version (e.g. v1.4.0)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (e.g. pending)' })
  getStories(
    @Query('version') version?: string,
    @Query('status') status?: string,
  ): Promise<Story[]> {
    return this.boardService.getStories(version, status);
  }

  @Get('releases')
  @ApiOperation({ summary: 'Get releases grouped by version' })
  getReleases(): Promise<Release[]> {
    return this.boardService.getReleases();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get metrics and suggestions' })
  getMetrics(): Promise<Metrics> {
    return this.boardService.getMetrics();
  }
}

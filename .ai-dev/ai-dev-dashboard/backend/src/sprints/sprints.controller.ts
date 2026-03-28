import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { SprintsService, Sprint, CreateSprintDto, AssignStoriesDto, DailyProgressDto } from './sprints.service';

@ApiTags('sprints')
@Controller('api/sprints')
export class SprintsController {
    constructor(private readonly sprintsService: SprintsService) { }

    @Get()
    @ApiOperation({ summary: 'List all sprints' })
    getSprints(): Promise<Sprint[]> {
        return this.sprintsService.getSprints();
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active sprint' })
    getActiveSprint(): Promise<Sprint | null> {
        return this.sprintsService.getActiveSprint();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get sprint by ID' })
    @ApiParam({ name: 'id', description: 'Sprint ID' })
    getSprintById(@Param('id') id: string): Promise<Sprint> {
        return this.sprintsService.getSprintById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new sprint' })
    @ApiBody({ type: CreateSprintDto })
    createSprint(@Body() dto: CreateSprintDto): Promise<Sprint> {
        return this.sprintsService.createSprint(dto);
    }

    @Put(':id/stories')
    @ApiOperation({ summary: 'Assign stories to sprint' })
    @ApiParam({ name: 'id', description: 'Sprint ID' })
    @ApiBody({ type: AssignStoriesDto })
    assignStories(@Param('id') id: string, @Body() dto: AssignStoriesDto): Promise<Sprint> {
        return this.sprintsService.assignStories(id, dto);
    }

    @Post(':id/daily-progress')
    @ApiOperation({ summary: 'Record daily progress' })
    @ApiParam({ name: 'id', description: 'Sprint ID' })
    @ApiBody({ type: DailyProgressDto })
    recordDailyProgress(@Param('id') id: string, @Body() dto: DailyProgressDto): Promise<Sprint> {
        return this.sprintsService.recordDailyProgress(id, dto);
    }
}

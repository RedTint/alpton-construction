import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { StoriesService, Story } from './stories.service';
import { CreateStoryDto, UpdateStoryStatusDto } from './dto/story.dto';

@ApiTags('stories')
@Controller('api')
export class StoriesController {
    constructor(private readonly storiesService: StoriesService) { }

    @Get('stories/:id')
    @ApiOperation({ summary: 'Get story by ID' })
    @ApiParam({ name: 'id', description: 'Story ID (e.g. 001.003)' })
    getStoryById(@Param('id') id: string): Promise<Story> {
        return this.storiesService.getStoryById(id);
    }

    @Put('stories/:id/status')
    @ApiOperation({ summary: 'Update story status (move between directories)' })
    @ApiParam({ name: 'id', description: 'Story ID' })
    @ApiBody({ type: UpdateStoryStatusDto })
    updateStoryStatus(
        @Param('id') id: string,
        @Body() dto: UpdateStoryStatusDto,
    ): Promise<Story> {
        return this.storiesService.moveStory(id, dto);
    }

    @Get('epics/:epicId/stories')
    @ApiOperation({ summary: 'Get stories for a specific epic' })
    @ApiParam({ name: 'epicId', description: 'Epic ID (e.g. 001)' })
    getStoriesByEpic(@Param('epicId') epicId: string): Promise<Story[]> {
        return this.storiesService.getStoriesByEpic(epicId);
    }

    @Post('stories')
    @ApiOperation({ summary: 'Create a new story' })
    @ApiBody({ type: CreateStoryDto })
    createStory(@Body() dto: CreateStoryDto): Promise<Story> {
        return this.storiesService.createStory(dto);
    }
}

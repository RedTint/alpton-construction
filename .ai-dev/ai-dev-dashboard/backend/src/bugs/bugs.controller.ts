import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { BugsService, Bug } from './bugs.service';
import { CreateBugDto, UpdateBugStatusDto } from './dto/bug.dto';

@ApiTags('bugs')
@Controller('api/bugs')
export class BugsController {
    constructor(private readonly bugsService: BugsService) { }

    @Get()
    @ApiOperation({ summary: 'List all bugs' })
    getBugs(): Promise<Bug[]> {
        return this.bugsService.getBugs();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get bug by ID' })
    @ApiParam({ name: 'id', description: 'Bug ID' })
    getBugById(@Param('id') id: string): Promise<Bug> {
        return this.bugsService.getBugById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new bug' })
    @ApiBody({ type: CreateBugDto })
    createBug(@Body() dto: CreateBugDto): Promise<Bug> {
        return this.bugsService.createBug(dto);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Update bug status' })
    @ApiParam({ name: 'id', description: 'Bug ID' })
    @ApiBody({ type: UpdateBugStatusDto })
    updateBugStatus(
        @Param('id') id: string,
        @Body() dto: UpdateBugStatusDto,
    ): Promise<Bug> {
        return this.bugsService.updateBugStatus(id, dto);
    }
}

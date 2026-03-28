import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStoryStatusDto {
    @ApiProperty({
        description: 'New status for the story',
        enum: ['pending', 'in-progress', 'qa', 'done', 'blocked'],
        example: 'in-progress',
    })
    status: string;
}

export class CreateStoryDto {
    @ApiProperty({ description: 'Epic ID this story belongs to', example: '001' })
    epicId: string;

    @ApiProperty({ description: 'Story title', example: 'User Login' })
    title: string;

    @ApiPropertyOptional({ description: 'Story description' })
    description?: string;

    @ApiPropertyOptional({ description: 'Priority', enum: ['high', 'medium', 'low'] })
    priority?: string;

    @ApiPropertyOptional({ description: 'Story points', example: 5 })
    effort?: number;
}

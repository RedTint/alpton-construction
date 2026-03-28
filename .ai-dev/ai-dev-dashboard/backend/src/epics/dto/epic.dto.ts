import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpicDto {
    @ApiProperty({ description: 'Epic name in kebab-case', example: 'user-auth' })
    name: string;

    @ApiProperty({ description: 'Epic title', example: 'User Authentication' })
    title: string;

    @ApiPropertyOptional({ description: 'Epic description' })
    description?: string;

    @ApiPropertyOptional({ description: 'Priority', enum: ['high', 'medium', 'low'] })
    priority?: string;
}

export class UpdateEpicDto {
    @ApiPropertyOptional({ description: 'Epic title' })
    title?: string;

    @ApiPropertyOptional({ description: 'Epic description' })
    description?: string;

    @ApiPropertyOptional({ description: 'Priority', enum: ['high', 'medium', 'low'] })
    priority?: string;

    @ApiPropertyOptional({ description: 'Status', enum: ['active', 'completed', 'archived'] })
    status?: string;
}

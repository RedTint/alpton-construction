import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBugDto {
    @ApiProperty({ description: 'Bug name in kebab-case', example: 'token-expiry' })
    name: string;

    @ApiProperty({ description: 'Bug title', example: 'Token expires prematurely' })
    title: string;

    @ApiPropertyOptional({ description: 'Bug description' })
    description?: string;

    @ApiProperty({ description: 'Severity', enum: ['critical', 'high', 'medium', 'low'], example: 'high' })
    severity: string;

    @ApiPropertyOptional({ description: 'Impact description' })
    impact?: string;

    @ApiPropertyOptional({ description: 'Root cause analysis' })
    rca?: string;
}

export class UpdateBugStatusDto {
    @ApiProperty({
        description: 'New status',
        enum: ['pending', 'in-progress', 'qa', 'fixed', 'wontfix'],
        example: 'in-progress',
    })
    status: string;
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { SprintsService } from './sprints.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('SprintsService', () => {
    let service: SprintsService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SprintsService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: { parseMarkdown: jest.fn(), writeMarkdown: jest.fn() } },
            ],
        }).compile();
        service = module.get<SprintsService>(SprintsService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getSprints', () => {
        it('should return empty array when sprints dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getSprints()).toEqual([]);
        });

        it('should return sprints from files', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue(['sprint-001.md' as any]);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Sprint 1', start_date: '2026-03-15', end_date: '2026-03-29', capacity_points: 40, stories: [], daily_progress: [], status: 'active' },
                content: '',
            });

            const result = await service.getSprints();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Sprint 1');
        });
    });

    describe('getActiveSprint', () => {
        it('should return null when no active sprint', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getActiveSprint()).toBeNull();
        });
    });

    describe('createSprint', () => {
        it('should create sprint file', async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockReturnValue(undefined);
            mockFs.readdirSync.mockReturnValue([]);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Sprint 1', start_date: '2026-03-15', end_date: '2026-03-29', capacity_points: 40, stories: [], daily_progress: [], status: 'active' },
                content: '',
            });

            await service.createSprint({ title: 'Sprint 1', startDate: '2026-03-15', endDate: '2026-03-29', capacityPoints: 40 });
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });

    describe('calculateVelocity', () => {
        it('should sum points from daily progress', () => {
            const sprint = { id: '001', title: 'S1', startDate: '', endDate: '', capacityPoints: 40, stories: [], dailyProgress: [{ date: 'd1', pointsCompleted: 5 }, { date: 'd2', pointsCompleted: 8 }], status: 'active', path: '' };
            expect(service.calculateVelocity(sprint)).toBe(13);
        });
    });

    describe('calculateBurndown', () => {
        it('should calculate remaining points', () => {
            const sprint = { id: '001', title: 'S1', startDate: '', endDate: '', capacityPoints: 20, stories: [], dailyProgress: [{ date: 'd1', pointsCompleted: 5 }, { date: 'd2', pointsCompleted: 8 }], status: 'active', path: '' };
            const burndown = service.calculateBurndown(sprint);
            expect(burndown).toEqual([{ date: 'd1', remaining: 15 }, { date: 'd2', remaining: 7 }]);
        });
    });
});

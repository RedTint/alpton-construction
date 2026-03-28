import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProgressService } from './progress.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('ProgressService', () => {
    let service: ProgressService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProgressService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: { parseMarkdown: jest.fn() } },
            ],
        }).compile();
        service = module.get<ProgressService>(ProgressService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getProgress', () => {
        it('should return empty stats when epics dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            const result = await service.getProgress();
            expect(result.totalStories).toBe(0);
            expect(result.completionPct).toBe(0);
        });

        it('should calculate progress from file system', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockImplementation((dir: any) => {
                const d = String(dir);
                if (d.endsWith('epics')) return ['001-epic-auth' as any];
                if (d.endsWith('done')) return ['001.001-login.md' as any];
                if (d.endsWith('pending')) return ['001.002-logout.md' as any];
                return [];
            });
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { effort: 5 }, content: '',
            });

            const result = await service.getProgress();
            expect(result.totalStories).toBe(2);
            expect(result.completed).toBe(1);
            expect(result.pending).toBe(1);
            expect(result.completionPct).toBe(50);
        });
    });
});

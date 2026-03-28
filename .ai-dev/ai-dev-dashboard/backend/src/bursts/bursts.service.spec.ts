import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { BurstsService } from './bursts.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('BurstsService', () => {
    let service: BurstsService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BurstsService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: { parseMarkdown: jest.fn(), writeMarkdown: jest.fn() } },
            ],
        }).compile();
        service = module.get<BurstsService>(BurstsService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getBursts', () => {
        it('should return empty array when bursts dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getBursts()).toEqual([]);
        });
    });

    describe('getActiveBurst', () => {
        it('should return null when no active burst', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getActiveBurst()).toBeNull();
        });
    });

    describe('createBurst', () => {
        it('should create burst file', async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockReturnValue(undefined);
            mockFs.readdirSync.mockReturnValue([]);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', focus_area: 'Auth', stories: [], sessions: [], status: 'active' },
                content: '',
            });

            await service.createBurst({ focusArea: 'Auth' });
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });

    describe('startSession', () => {
        it('should add session to burst', async () => {
            jest.spyOn(service, 'getBurstById').mockResolvedValue({
                id: '001', focusArea: 'Auth', stories: [], sessions: [], status: 'active', path: '/fake/burst-001.md',
            });
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { sessions: [] }, content: '',
            });
            markdownService.parseMarkdown.mockReturnValueOnce({
                frontmatter: { sessions: [] }, content: '',
            });
            // For the readBurst after write
            markdownService.parseMarkdown.mockReturnValueOnce({
                frontmatter: { id: '001', focus_area: 'Auth', stories: [], sessions: [{ id: '001', started_at: '2026-03-15', flow_state: 'focused', energy_level: 'high', notes: '' }], status: 'active' },
                content: '',
            });

            await service.startSession('001', { energyLevel: 'high' });
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });
});

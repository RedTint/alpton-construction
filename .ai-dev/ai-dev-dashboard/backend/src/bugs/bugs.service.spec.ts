import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { BugsService } from './bugs.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('BugsService', () => {
    let service: BugsService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BugsService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: { parseMarkdown: jest.fn(), writeMarkdown: jest.fn() } },
            ],
        }).compile();
        service = module.get<BugsService>(BugsService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getBugs', () => {
        it('should return empty array when bugs dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getBugs()).toEqual([]);
        });
    });

    describe('getBugById', () => {
        it('should throw NotFoundException when bug not found', async () => {
            mockFs.existsSync.mockReturnValue(false);
            await expect(service.getBugById('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('createBug', () => {
        it('should create bug directory structure', async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockReturnValue(undefined);
            mockFs.readdirSync.mockReturnValue([]);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001.001', title: 'Test Bug', severity: 'high', status: 'pending' },
                content: '',
            });

            const result = await service.createBug({
                name: 'test-bug', title: 'Test Bug', severity: 'high',
            });

            expect(mockFs.mkdirSync).toHaveBeenCalled();
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });

    describe('updateBugStatus', () => {
        it('should reject invalid status', async () => {
            jest.spyOn(service, 'getBugById').mockResolvedValue({
                id: '001.001', name: 'Bug', title: 'Bug', description: '',
                severity: 'high', impact: '', rca: '', status: 'pending', path: '/fake/bugs/001/pending/001.001.md',
            });
            await expect(service.updateBugStatus('001.001', { status: 'invalid' })).rejects.toThrow();
        });
    });
});

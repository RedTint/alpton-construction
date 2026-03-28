import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { EpicsService } from './epics.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('EpicsService', () => {
    let service: EpicsService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const mockMarkdownService = {
            parseMarkdown: jest.fn(),
            writeMarkdown: jest.fn(),
            extractFrontmatter: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EpicsService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: mockMarkdownService },
            ],
        }).compile();

        service = module.get<EpicsService>(EpicsService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getEpics', () => {
        it('should return empty array when epics dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            const result = await service.getEpics();
            expect(result).toEqual([]);
        });

        it('should return list of epics from directories', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue(['001-epic-auth' as any]);
            mockFs.statSync.mockReturnValue({ isDirectory: () => true } as any);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Auth', description: 'Auth system', priority: 'high', status: 'active' },
                content: '# Auth',
            });

            const result = await service.getEpics();
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Auth');
            expect(result[0].id).toBe('001');
        });
    });

    describe('getEpicById', () => {
        it('should throw NotFoundException when epic not found', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockReturnValue([]);

            await expect(service.getEpicById('999')).rejects.toThrow(NotFoundException);
        });

        it('should return epic by ID', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockImplementation((dir: any) => {
                if (String(dir).endsWith('epics')) return ['001-epic-auth' as any];
                return [];
            });
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Auth', description: '', priority: 'high', status: 'active' },
                content: '',
            });

            const result = await service.getEpicById('001');
            expect(result.id).toBe('001');
            expect(result.title).toBe('Auth');
        });
    });

    describe('createEpic', () => {
        it('should create epic directory with status subdirectories', async () => {
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockReturnValue(undefined);
            mockFs.readdirSync.mockReturnValue([]);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'My Epic', description: 'Desc', priority: 'high', status: 'active' },
                content: '',
            });

            const result = await service.createEpic({
                name: 'my-epic', title: 'My Epic', description: 'Desc', priority: 'high',
            });

            expect(mockFs.mkdirSync).toHaveBeenCalled();
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });

    describe('updateEpic', () => {
        it('should update epic frontmatter', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockImplementation((dir: any) => {
                if (String(dir).endsWith('epics')) return ['001-epic-auth' as any];
                return [];
            });
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Auth', description: '', priority: 'high', status: 'active' },
                content: '# Auth',
            });

            await service.updateEpic('001', { title: 'Updated Auth' });
            expect(markdownService.writeMarkdown).toHaveBeenCalled();
        });
    });

    describe('deleteEpic', () => {
        it('should delete epic directory', async () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readdirSync.mockImplementation((dir: any) => {
                if (String(dir).endsWith('epics')) return ['001-epic-auth' as any];
                return [];
            });
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { id: '001', title: 'Auth' }, content: '',
            });
            mockFs.rmSync.mockReturnValue(undefined);

            await service.deleteEpic('001');
            expect(mockFs.rmSync).toHaveBeenCalled();
        });
    });
});

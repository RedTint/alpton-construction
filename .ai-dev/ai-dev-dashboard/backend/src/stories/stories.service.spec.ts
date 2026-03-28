import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('StoriesService', () => {
    let service: StoriesService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const mockMarkdownService = {
            parseMarkdown: jest.fn(),
            writeMarkdown: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoriesService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: mockMarkdownService },
            ],
        }).compile();

        service = module.get<StoriesService>(StoriesService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getStories', () => {
        it('should return empty array when epics dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            const result = await service.getStories();
            expect(result).toEqual([]);
        });
    });

    describe('getStoryById', () => {
        it('should throw NotFoundException when story not found', async () => {
            mockFs.existsSync.mockReturnValue(false);
            await expect(service.getStoryById('999')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getStoriesByEpic', () => {
        it('should return empty array when no stories match epic', async () => {
            mockFs.existsSync.mockReturnValue(false);
            const result = await service.getStoriesByEpic('999');
            expect(result).toEqual([]);
        });
    });

    describe('moveStory', () => {
        it('should reject invalid status', async () => {
            // Mock getStoryById to return a story
            mockFs.existsSync.mockReturnValue(true);
            jest.spyOn(service, 'getStoryById').mockResolvedValue({
                id: '001.001', epicId: '001', title: 'Test', description: '',
                status: 'pending', priority: 'high', effort: 3, path: '/fake/epics/001-epic-test/pending/001.001-test.md',
            });

            await expect(service.moveStory('001.001', { status: 'invalid' })).rejects.toThrow('Invalid status');
        });

        it('should return same story if status unchanged', async () => {
            const story = {
                id: '001.001', epicId: '001', title: 'Test', description: '',
                status: 'pending', priority: 'high', effort: 3, path: '/fake/epics/001-epic-test/pending/001.001-test.md',
            };
            jest.spyOn(service, 'getStoryById').mockResolvedValue(story);

            const result = await service.moveStory('001.001', { status: 'pending' });
            expect(result.status).toBe('pending');
        });
    });
});

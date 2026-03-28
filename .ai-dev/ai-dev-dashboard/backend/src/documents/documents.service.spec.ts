import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { MarkdownService } from '../common/services/markdown.service';
import * as fs from 'fs';

jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('DocumentsService', () => {
    let service: DocumentsService;
    let markdownService: jest.Mocked<MarkdownService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DocumentsService,
                { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('/fake/docs') } },
                { provide: MarkdownService, useValue: { parseMarkdown: jest.fn(), readRawContent: jest.fn() } },
            ],
        }).compile();
        service = module.get<DocumentsService>(DocumentsService);
        markdownService = module.get(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('getDocuments', () => {
        it('should return empty array when docs dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(await service.getDocuments()).toEqual([]);
        });
    });

    describe('getDocumentByPath', () => {
        it('should throw NotFoundException for missing doc', async () => {
            mockFs.existsSync.mockReturnValue(false);
            await expect(service.getDocumentByPath('nonexistent.md')).rejects.toThrow(NotFoundException);
        });

        it('should return document with frontmatter', async () => {
            mockFs.existsSync.mockReturnValue(true);
            markdownService.parseMarkdown.mockReturnValue({
                frontmatter: { title: 'Test Doc' }, content: '# Test',
            });

            const result = await service.getDocumentByPath('test.md');
            expect(result.frontmatter.title).toBe('Test Doc');
            expect(result.content).toBe('# Test');
        });
    });

    describe('searchDocuments', () => {
        it('should return empty results when docs dir does not exist', async () => {
            mockFs.existsSync.mockReturnValue(false);
            const results = await service.searchDocuments('test');
            expect(results).toEqual([]);
        });
    });
});

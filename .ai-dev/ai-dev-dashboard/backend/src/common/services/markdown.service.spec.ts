import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from './markdown.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('MarkdownService', () => {
    let service: MarkdownService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarkdownService,
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();
        service = module.get<MarkdownService>(MarkdownService);
    });

    afterEach(() => jest.restoreAllMocks());

    describe('parseMarkdown', () => {
        it('should parse frontmatter and content from a markdown file', () => {
            const mdContent = `---\ntitle: Test\nstatus: active\n---\n# Hello World\n`;
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(mdContent);

            const result = service.parseMarkdown('/fake/test.md');

            expect(result.frontmatter.title).toBe('Test');
            expect(result.frontmatter.status).toBe('active');
            expect(result.content).toContain('# Hello World');
        });

        it('should throw when file does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(() => service.parseMarkdown('/fake/missing.md')).toThrow('File not found');
        });

        it('should handle markdown without frontmatter', () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('# No frontmatter\nJust content');

            const result = service.parseMarkdown('/fake/plain.md');
            expect(result.frontmatter).toEqual({});
            expect(result.content).toContain('# No frontmatter');
        });
    });

    describe('writeMarkdown', () => {
        it('should write markdown with frontmatter', () => {
            const frontmatter = { title: 'Test Epic', status: 'active' };
            const content = '# Test Epic\n\nDescription here\n';

            service.writeMarkdown('/fake/output.md', frontmatter, content);

            expect(mockFs.writeFileSync).toHaveBeenCalledWith(
                '/fake/output.md',
                expect.stringContaining('title: Test Epic'),
                'utf-8',
            );
        });
    });

    describe('extractFrontmatter', () => {
        it('should return only frontmatter', () => {
            const mdContent = `---\nid: '001'\ntitle: Epic One\n---\n# Content`;
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue(mdContent);

            const result = service.extractFrontmatter('/fake/test.md');
            expect(result.id).toBe('001');
            expect(result.title).toBe('Epic One');
        });
    });

    describe('readRawContent', () => {
        it('should return raw file content', () => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.readFileSync.mockReturnValue('raw content');

            const result = service.readRawContent('/fake/test.md');
            expect(result).toBe('raw content');
        });

        it('should throw when file does not exist', () => {
            mockFs.existsSync.mockReturnValue(false);
            expect(() => service.readRawContent('/fake/missing.md')).toThrow('File not found');
        });
    });
});

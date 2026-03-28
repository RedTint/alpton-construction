import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DocumentsService, DocumentInfo, DocumentContent } from './documents.service';

@ApiTags('documents')
@Controller('api/docs')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get()
    @ApiOperation({ summary: 'List all documents' })
    getDocuments(): Promise<DocumentInfo[]> {
        return this.documentsService.getDocuments();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search documents' })
    @ApiQuery({ name: 'q', description: 'Search query' })
    searchDocuments(@Query('q') query: string): Promise<DocumentContent[]> {
        return this.documentsService.searchDocuments(query);
    }

    @Get(':path(*)')
    @ApiOperation({ summary: 'Get document by path' })
    @ApiParam({ name: 'path', description: 'Relative path to document from docs/' })
    getDocumentByPath(@Param('path') path: string): Promise<DocumentContent> {
        return this.documentsService.getDocumentByPath(path);
    }
}

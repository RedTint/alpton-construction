import { DocumentsService, DocumentInfo, DocumentContent } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    getDocuments(): Promise<DocumentInfo[]>;
    searchDocuments(query: string): Promise<DocumentContent[]>;
    getDocumentByPath(path: string): Promise<DocumentContent>;
}

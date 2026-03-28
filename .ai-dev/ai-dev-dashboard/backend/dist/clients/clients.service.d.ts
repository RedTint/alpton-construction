import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
export interface ClientInfo {
    id: string;
    slug: string;
    name: string;
    status: string;
    activeDeliverables: number;
    openIssues: number;
    updatedAt: string;
    folderPath: string;
}
export interface ClientDoc {
    name: string;
    path: string;
    label: string;
}
export interface ClientDetail extends ClientInfo {
    docs: ClientDoc[];
}
export interface ClientDocContent {
    path: string;
    name: string;
    content: string;
    frontmatter: Record<string, any>;
}
export declare class ClientsService {
    private readonly configService;
    private readonly markdownService;
    private readonly logger;
    private readonly clientsPath;
    private readonly DOC_LABELS;
    constructor(configService: ConfigService, markdownService: MarkdownService);
    listClients(): Promise<ClientInfo[]>;
    getClient(id: string): Promise<ClientDetail>;
    getClientDoc(clientId: string, docPath: string): Promise<ClientDocContent>;
}

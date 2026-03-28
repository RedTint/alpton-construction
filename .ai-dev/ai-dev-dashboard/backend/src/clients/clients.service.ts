import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MarkdownService } from '../common/services/markdown.service';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

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

@Injectable()
export class ClientsService {
    private readonly logger = new Logger(ClientsService.name);
    private readonly clientsPath: string;

    private readonly DOC_LABELS: Record<string, string> = {
        '000.README.md': 'README',
        '001.client-profile.md': 'Profile',
        '002.client-deliverables.md': 'Deliverables',
        '003.client-context.md': 'Context',
        '004.client-issues.md': 'Issues',
        'meetings/README.md': 'Meetings',
    };

    constructor(
        private readonly configService: ConfigService,
        private readonly markdownService: MarkdownService,
    ) {
        const docsPath = configService.get<string>('DOCS_PATH') || join(process.cwd(), '../../../docs');
        this.clientsPath = join(docsPath, 'clients');
    }

    async listClients(): Promise<ClientInfo[]> {
        if (!existsSync(this.clientsPath)) return [];

        const clients: ClientInfo[] = [];

        for (const entry of readdirSync(this.clientsPath)) {
            const match = entry.match(/^(\d{3})-(.+)$/);
            if (!match) continue;

            const fullPath = join(this.clientsPath, entry);
            try {
                if (!statSync(fullPath).isDirectory()) continue;
            } catch { continue; }

            const id = match[1]!;
            const slug = match[2]!;
            const readmePath = join(fullPath, '000.README.md');

            try {
                const { frontmatter } = this.markdownService.parseMarkdown(readmePath);
                clients.push({
                    id,
                    slug,
                    name: frontmatter['client_name'] || slug,
                    status: frontmatter['status'] || 'active',
                    activeDeliverables: Number(frontmatter['active_deliverables']) || 0,
                    openIssues: Number(frontmatter['open_issues']) || 0,
                    updatedAt: frontmatter['updated_at'] || '',
                    folderPath: `clients/${entry}`,
                });
            } catch {
                clients.push({ id, slug, name: slug, status: 'active', activeDeliverables: 0, openIssues: 0, updatedAt: '', folderPath: `clients/${entry}` });
            }
        }

        return clients.sort((a, b) => a.id.localeCompare(b.id));
    }

    async getClient(id: string): Promise<ClientDetail> {
        const clients = await this.listClients();
        const client = clients.find((c) => c.id === id);
        if (!client) throw new NotFoundException(`Client not found: ${id}`);

        const clientDir = join(this.clientsPath, `${id}-${client.slug}`);
        const docs: ClientDoc[] = [];

        for (const entry of readdirSync(clientDir)) {
            if (!entry.endsWith('.md')) continue;
            docs.push({
                name: entry,
                path: `${client.folderPath}/${entry}`,
                label: this.DOC_LABELS[entry] || entry.replace('.md', ''),
            });
        }

        const meetingsReadme = join(clientDir, 'meetings', 'README.md');
        if (existsSync(meetingsReadme)) {
            docs.push({ name: 'meetings/README.md', path: `${client.folderPath}/meetings/README.md`, label: 'Meetings' });
        }

        docs.sort((a, b) => a.name.localeCompare(b.name));
        return { ...client, docs };
    }

    async getClientDoc(clientId: string, docPath: string): Promise<ClientDocContent> {
        const clients = await this.listClients();
        const client = clients.find((c) => c.id === clientId);
        if (!client) throw new NotFoundException(`Client not found: ${clientId}`);

        const fullPath = join(this.clientsPath, `${clientId}-${client.slug}`, docPath);
        if (!existsSync(fullPath)) throw new NotFoundException(`Document not found: ${docPath}`);

        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(fullPath);
            return { path: docPath, name: fullPath.split('/').pop()!, content, frontmatter };
        } catch {
            const raw = this.markdownService.readRawContent(fullPath);
            return { path: docPath, name: fullPath.split('/').pop()!, content: raw, frontmatter: {} };
        }
    }
}

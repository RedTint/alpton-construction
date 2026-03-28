"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClientsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const markdown_service_1 = require("../common/services/markdown.service");
const fs_1 = require("fs");
const path_1 = require("path");
let ClientsService = ClientsService_1 = class ClientsService {
    constructor(configService, markdownService) {
        this.configService = configService;
        this.markdownService = markdownService;
        this.logger = new common_1.Logger(ClientsService_1.name);
        this.DOC_LABELS = {
            '000.README.md': 'README',
            '001.client-profile.md': 'Profile',
            '002.client-deliverables.md': 'Deliverables',
            '003.client-context.md': 'Context',
            '004.client-issues.md': 'Issues',
            'meetings/README.md': 'Meetings',
        };
        const docsPath = configService.get('DOCS_PATH') || (0, path_1.join)(process.cwd(), '../../../docs');
        this.clientsPath = (0, path_1.join)(docsPath, 'clients');
    }
    async listClients() {
        if (!(0, fs_1.existsSync)(this.clientsPath))
            return [];
        const clients = [];
        for (const entry of (0, fs_1.readdirSync)(this.clientsPath)) {
            const match = entry.match(/^(\d{3})-(.+)$/);
            if (!match)
                continue;
            const fullPath = (0, path_1.join)(this.clientsPath, entry);
            try {
                if (!(0, fs_1.statSync)(fullPath).isDirectory())
                    continue;
            }
            catch {
                continue;
            }
            const id = match[1];
            const slug = match[2];
            const readmePath = (0, path_1.join)(fullPath, '000.README.md');
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
            }
            catch {
                clients.push({ id, slug, name: slug, status: 'active', activeDeliverables: 0, openIssues: 0, updatedAt: '', folderPath: `clients/${entry}` });
            }
        }
        return clients.sort((a, b) => a.id.localeCompare(b.id));
    }
    async getClient(id) {
        const clients = await this.listClients();
        const client = clients.find((c) => c.id === id);
        if (!client)
            throw new common_1.NotFoundException(`Client not found: ${id}`);
        const clientDir = (0, path_1.join)(this.clientsPath, `${id}-${client.slug}`);
        const docs = [];
        for (const entry of (0, fs_1.readdirSync)(clientDir)) {
            if (!entry.endsWith('.md'))
                continue;
            docs.push({
                name: entry,
                path: `${client.folderPath}/${entry}`,
                label: this.DOC_LABELS[entry] || entry.replace('.md', ''),
            });
        }
        const meetingsReadme = (0, path_1.join)(clientDir, 'meetings', 'README.md');
        if ((0, fs_1.existsSync)(meetingsReadme)) {
            docs.push({ name: 'meetings/README.md', path: `${client.folderPath}/meetings/README.md`, label: 'Meetings' });
        }
        docs.sort((a, b) => a.name.localeCompare(b.name));
        return { ...client, docs };
    }
    async getClientDoc(clientId, docPath) {
        const clients = await this.listClients();
        const client = clients.find((c) => c.id === clientId);
        if (!client)
            throw new common_1.NotFoundException(`Client not found: ${clientId}`);
        const fullPath = (0, path_1.join)(this.clientsPath, `${clientId}-${client.slug}`, docPath);
        if (!(0, fs_1.existsSync)(fullPath))
            throw new common_1.NotFoundException(`Document not found: ${docPath}`);
        try {
            const { frontmatter, content } = this.markdownService.parseMarkdown(fullPath);
            return { path: docPath, name: fullPath.split('/').pop(), content, frontmatter };
        }
        catch {
            const raw = this.markdownService.readRawContent(fullPath);
            return { path: docPath, name: fullPath.split('/').pop(), content: raw, frontmatter: {} };
        }
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = ClientsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        markdown_service_1.MarkdownService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map
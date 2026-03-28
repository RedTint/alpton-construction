import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { clientsApi, type ClientInfo, type ClientDetail, type ClientDocContent } from '@/services/clientsApi';

// Resolve a relative markdown link href against the current doc path.
// Returns the normalized relative path (within the client folder) or null if not a local .md link.
function resolveRelativeMdPath(currentPath: string, href: string): string | null {
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return null;
    if (!href.endsWith('.md')) return null;
    const dir = currentPath.includes('/') ? currentPath.slice(0, currentPath.lastIndexOf('/')) : '';
    const combined = dir ? `${dir}/${href}` : href;
    const out: string[] = [];
    for (const p of combined.split('/')) {
        if (p === '' || p === '.') continue;
        if (p === '..') out.pop();
        else out.push(p);
    }
    return out.join('/') || null;
}

interface TrailItem { docPath: string; label: string; }
import { cn } from '@/lib/utils';
import {
    Users,
    Search,
    ChevronLeft,
    ChevronRight,
    FileText,
    List,
    AlertCircle,
    CheckSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MermaidDiagram } from '@/components/docs/MermaidDiagram';

const STATUS_FILTERS = ['All', 'active', 'on_hold', 'completed', 'archived'] as const;

const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    archived: 'Archived',
};

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    on_hold: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

function extractHeadings(content: string): { level: number; text: string; id: string }[] {
    const headings: { level: number; text: string; id: string }[] = [];
    const lines = content.split('\n');
    let inCodeBlock = false;

    for (const line of lines) {
        if (line.startsWith('```')) { inCodeBlock = !inCodeBlock; continue; }
        if (inCodeBlock) continue;
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
            const level = match[1]!.length;
            const text = match[2]!.replace(/\*\*/g, '').replace(/`/g, '').trim();
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            headings.push({ level, text, id });
        }
    }
    return headings;
}

export function ClientsPage() {
    const [clients, setClients] = useState<ClientInfo[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDetail | null>(null);
    const [selectedDoc, setSelectedDoc] = useState<ClientDocContent | null>(null);
    const [trail, setTrail] = useState<TrailItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [docLoading, setDocLoading] = useState(false);
    const [showTOC, setShowTOC] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        clientsApi.getAll()
            .then(setClients)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filteredClients = useMemo(() => {
        return clients.filter((c) => {
            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [clients, statusFilter, searchQuery]);

    const tocHeadings = useMemo(() => {
        if (!selectedDoc) return [];
        return extractHeadings(selectedDoc.content);
    }, [selectedDoc]);

    const fetchAndDisplay = useCallback(async (clientId: string, docPath: string) => {
        setDocLoading(true);
        try {
            const doc = await clientsApi.getDoc(clientId, docPath);
            setSelectedDoc(doc);
            contentRef.current?.scrollTo(0, 0);
            return doc;
        } catch { return null; }
        finally { setDocLoading(false); }
    }, []);

    const loadDoc = useCallback(async (clientId: string, docPath: string, label?: string) => {
        const doc = await fetchAndDisplay(clientId, docPath);
        if (doc) setTrail([{ docPath, label: label || docPath }]);
    }, [fetchAndDisplay]);

    const followMdLink = useCallback(async (clientId: string, resolvedPath: string) => {
        const doc = await fetchAndDisplay(clientId, resolvedPath);
        if (doc) setTrail((prev) => [...prev, { docPath: resolvedPath, label: resolvedPath.split('/').pop() || resolvedPath }]);
    }, [fetchAndDisplay]);

    const navigateTrail = useCallback(async (idx: number, clientId: string) => {
        const item = trail[idx];
        if (!item) return;
        const doc = await fetchAndDisplay(clientId, item.docPath);
        if (doc) setTrail((prev) => prev.slice(0, idx + 1));
    }, [trail, fetchAndDisplay]);

    const selectClient = useCallback(async (client: ClientInfo) => {
        try {
            const detail = await clientsApi.getById(client.id);
            setSelectedClient(detail);
            setSelectedDoc(null);
            setTrail([]);
            const readme = detail.docs.find((d) => d.name === '000.README.md');
            if (readme) await loadDoc(client.id, readme.name, 'README');
        } catch { /* ignore */ }
    }, [loadDoc]);

    return (
        <div className="flex h-screen">
            {/* Left sidebar */}
            <aside className="w-72 border-r border-border bg-card/50 flex flex-col" data-testid="clients-sidebar">

                {/* Back button when client is selected */}
                {selectedClient ? (
                    <div className="p-3 border-b border-border">
                        <button
                            onClick={() => { setSelectedClient(null); setSelectedDoc(null); }}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
                            data-testid="clients-back"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            All Clients
                        </button>

                        {/* Client header */}
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground leading-tight">{selectedClient.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">#{selectedClient.id}</p>
                            </div>
                            <span className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5',
                                STATUS_COLORS[selectedClient.status] ?? STATUS_COLORS['active'],
                            )}>
                                {STATUS_LABELS[selectedClient.status] ?? selectedClient.status}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <CheckSquare className="w-3 h-3" />
                                {selectedClient.activeDeliverables} deliverables
                            </span>
                            <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {selectedClient.openIssues} issues
                            </span>
                        </div>
                    </div>
                ) : (
                    /* Search bar when showing client list */
                    <div className="p-3 border-b border-border">
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search clients..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                                data-testid="clients-search"
                            />
                        </div>

                        {/* Status filter tabs */}
                        <div className="flex flex-wrap gap-1">
                            {STATUS_FILTERS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                                        statusFilter === s
                                            ? 'bg-primary/15 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                                    )}
                                    data-testid={`filter-${s}`}
                                >
                                    {s === 'All' ? 'All' : (STATUS_LABELS[s] ?? s)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content: client list or doc list */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {selectedClient ? (
                        /* Document list for selected client */
                        selectedClient.docs.map((doc) => (
                            <button
                                key={doc.path}
                                onClick={() => loadDoc(selectedClient.id, doc.name, doc.label)}
                                className={cn(
                                    'w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors',
                                    selectedDoc?.name === doc.name
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                                )}
                                data-testid={`client-doc-${doc.name}`}
                            >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span>{doc.label}</span>
                            </button>
                        ))
                    ) : loading ? (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary rounded animate-pulse" />)}
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">No clients found</p>
                        </div>
                    ) : (
                        /* Client cards */
                        filteredClients.map((client) => (
                            <button
                                key={client.id}
                                onClick={() => selectClient(client)}
                                className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-secondary/60 transition-colors"
                                data-testid={`client-card-${client.id}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <p className="text-sm font-medium text-foreground leading-tight">{client.name}</p>
                                    <span className={cn(
                                        'text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0',
                                        STATUS_COLORS[client.status] ?? STATUS_COLORS['active'],
                                    )}>
                                        {STATUS_LABELS[client.status] ?? client.status}
                                    </span>
                                </div>
                                <div className="flex gap-3 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CheckSquare className="w-2.5 h-2.5" />
                                        {client.activeDeliverables}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5" />
                                        {client.openIssues}
                                    </span>
                                    {client.updatedAt && (
                                        <span className="ml-auto opacity-60">{client.updatedAt}</span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </nav>
            </aside>

            {/* Main content - document viewer */}
            <div ref={contentRef} className="flex-1 overflow-y-auto" data-testid="clients-content">
                {docLoading ? (
                    <div className="p-8">
                        <div className="h-8 w-64 bg-secondary rounded animate-pulse mb-4" />
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-4 bg-secondary rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />
                            ))}
                        </div>
                    </div>
                ) : selectedDoc ? (
                    <div className="max-w-4xl mx-auto px-8 py-6">
                        {/* Breadcrumb */}
                        <nav className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground mb-4">
                            <Users className="w-3 h-3" />
                            <button
                                onClick={() => { setSelectedClient(null); setSelectedDoc(null); setTrail([]); }}
                                className="hover:text-foreground transition-colors"
                            >
                                Clients
                            </button>
                            {selectedClient && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <button
                                        onClick={() => { setSelectedDoc(null); setTrail([]); }}
                                        className="text-foreground font-medium hover:text-primary transition-colors"
                                    >
                                        {selectedClient.name}
                                    </button>
                                </>
                            )}
                            {trail.map((item, idx) => (
                                <span key={idx} className="flex items-center gap-1">
                                    <ChevronRight className="w-3 h-3" />
                                    {idx === trail.length - 1 ? (
                                        <span className="text-primary">{item.label}</span>
                                    ) : (
                                        <button
                                            onClick={() => navigateTrail(idx, selectedClient!.id)}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            {item.label}
                                        </button>
                                    )}
                                </span>
                            ))}
                        </nav>

                        {/* Doc header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{selectedDoc.name}</h1>
                                <p className="text-xs text-muted-foreground mt-1">{selectedDoc.path}</p>
                            </div>
                            <button
                                onClick={() => setShowTOC(!showTOC)}
                                className={cn(
                                    'p-1.5 rounded-lg border transition-colors',
                                    showTOC ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-muted-foreground',
                                )}
                                title="Table of Contents"
                                data-testid="clients-toc-toggle"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>

                        {/* TOC */}
                        {showTOC && tocHeadings.length > 2 && (
                            <div className="mb-6 rounded-xl border border-border bg-card/50 p-4" data-testid="clients-toc">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Table of Contents</h3>
                                <nav className="space-y-0.5">
                                    {tocHeadings.filter((h) => h.level <= 3).map((h, i) => (
                                        <a
                                            key={`${h.id}-${i}`}
                                            href={`#${h.id}`}
                                            className={cn(
                                                'block text-xs text-muted-foreground hover:text-foreground transition-colors',
                                                h.level === 1 && 'font-semibold text-foreground',
                                                h.level === 2 && 'pl-3',
                                                h.level === 3 && 'pl-6 opacity-70',
                                            )}
                                        >
                                            {h.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Markdown content */}
                        <article className="prose prose-sm max-w-none" data-testid="client-doc-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    a({ href, children, ...props }) {
                                        const resolved = resolveRelativeMdPath(selectedDoc.path, href || '');
                                        if (resolved && selectedClient) {
                                            return (
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); followMdLink(selectedClient.id, resolved); }}
                                                    className="text-primary underline cursor-pointer"
                                                >
                                                    {children}
                                                </a>
                                            );
                                        }
                                        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                                    },
                                    code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const lang = match?.[1];
                                        const codeString = String(children).replace(/\n$/, '');
                                        if (lang === 'mermaid') return <MermaidDiagram chart={codeString} />;
                                        return <code className={className} {...props}>{children}</code>;
                                    },
                                    h1: ({ children, ...props }) => {
                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h1 id={id} {...props}>{children}</h1>;
                                    },
                                    h2: ({ children, ...props }) => {
                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h2 id={id} {...props}>{children}</h2>;
                                    },
                                    h3: ({ children, ...props }) => {
                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h3 id={id} {...props}>{children}</h3>;
                                    },
                                }}
                            >
                                {selectedDoc.content}
                            </ReactMarkdown>
                        </article>
                    </div>
                ) : selectedClient ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a document from the sidebar to view</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a client to view their documents</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

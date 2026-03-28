import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { docsApi, type DocumentInfo, type DocumentContent } from '@/services/docsApi';
import { cn } from '@/lib/utils';
import { FileText, Search, ChevronRight, ChevronDown, FolderOpen, Folder, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { MermaidDiagram } from '@/components/docs/MermaidDiagram';

// Category keys
const PLANNING = '📋 Planning (000-199)';
const DEVELOPMENT = '🛠️ Development (200-299)';
const IMPLEMENTATION = '💻 Implementation (300-399)';
const QUALITY = '🧪 Quality (400-499)';
const PROGRESS = '📊 Progress & Releases';
const ADRS = '🏛️ ADRs';
const OTHER = '📁 Other';

// A version-grouped document (multiple files → one entry)
interface GroupedDoc {
    baseName: string;        // e.g. "002-prd"
    displayName: string;     // e.g. "002-prd" (without version)
    latestVersion: string;   // e.g. "v1.6.0"
    versions: { version: string; path: string; name: string }[];
    latestPath: string;      // path of the latest version
    category: string;
}

// Extract base name and version from a filename
// e.g. "002-prd-v1.6.0.md" → { baseName: "002-prd", version: "v1.6.0" }
// e.g. "000-README.md" → { baseName: "000-README", version: null }
function parseVersionedName(name: string): { baseName: string; version: string | null } {
    const match = name.match(/^(.+)-v(\d+\.\d+\.\d+)\.md$/);
    if (match) {
        return { baseName: match[1]!, version: `v${match[2]}` };
    }
    return { baseName: name.replace(/\.md$/, ''), version: null };
}

// Compare semantic versions: "v1.6.0" > "v1.5.0"
function compareVersions(a: string, b: string): number {
    const pa = a.replace('v', '').split('.').map(Number);
    const pb = b.replace('v', '').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const diff = (pa[i] || 0) - (pb[i] || 0);
        if (diff !== 0) return diff;
    }
    return 0;
}

// Determine category for a doc
function getCategory(doc: DocumentInfo): string {
    const name = doc.name;
    const match = name.match(/^(\d+)/);
    const num = match?.[1] ? parseInt(match[1]) : -1;

    if (name.includes('adr') || doc.path.includes('adr')) return ADRS;
    if (doc.path.includes('progress') || doc.path.includes('release')) return PROGRESS;
    if (num >= 0 && num < 200) return PLANNING;
    if (num >= 200 && num < 300) return DEVELOPMENT;
    if (num >= 300 && num < 400) return IMPLEMENTATION;
    if (num >= 400 && num < 500) return QUALITY;
    return OTHER;
}

// Group docs by base name, keeping only unique grouped entries with all versions
function groupDocs(docs: DocumentInfo[]): GroupedDoc[] {
    const groups = new Map<string, GroupedDoc>();

    for (const doc of docs) {
        const { baseName, version } = parseVersionedName(doc.name);
        const category = getCategory(doc);
        const key = `${category}::${baseName}`;

        if (!groups.has(key)) {
            groups.set(key, {
                baseName,
                displayName: baseName,
                latestVersion: version || '',
                versions: [],
                latestPath: doc.path,
                category,
            });
        }

        const group = groups.get(key)!;
        if (version) {
            group.versions.push({ version, path: doc.path, name: doc.name });
            // Sort versions descending and update latest
            group.versions.sort((a, b) => compareVersions(b.version, a.version));
            group.latestVersion = group.versions[0]!.version;
            group.latestPath = group.versions[0]!.path;
        } else {
            // Non-versioned file
            if (group.versions.length === 0) {
                group.latestPath = doc.path;
            }
        }
    }

    return Array.from(groups.values()).sort((a, b) => a.baseName.localeCompare(b.baseName));
}

// Categorize grouped docs
function categorizeGrouped(grouped: GroupedDoc[]): Record<string, GroupedDoc[]> {
    const categories: Record<string, GroupedDoc[]> = {
        [PLANNING]: [],
        [DEVELOPMENT]: [],
        [IMPLEMENTATION]: [],
        [QUALITY]: [],
        [PROGRESS]: [],
        [ADRS]: [],
        [OTHER]: [],
    };

    for (const doc of grouped) {
        categories[doc.category]?.push(doc);
    }

    return Object.fromEntries(Object.entries(categories).filter(([, v]) => v.length > 0));
}

// Extract headings from markdown for TOC
function extractHeadings(content: string): { level: number; text: string; id: string }[] {
    const headings: { level: number; text: string; id: string }[] = [];
    const lines = content.split('\n');
    let inCodeBlock = false;

    for (const line of lines) {
        if (line.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
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

// Resolve a relative markdown href against the current doc path (relative to docs root).
// Returns a normalized docs-root-relative path, or null if not a local .md link.
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

interface TrailItem { path: string; label: string; }

export function DocsPage() {
    const [docs, setDocs] = useState<DocumentInfo[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DocumentContent | null>(null);
    const [trail, setTrail] = useState<TrailItem[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<DocumentContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [docLoading, setDocLoading] = useState(false);
    const [showTOC, setShowTOC] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        docsApi.getAll()
            .then((data) => {
                setDocs(data);
                const grouped = groupDocs(data);
                const cats = Object.keys(categorizeGrouped(grouped));
                if (cats.length > 0 && cats[0]) setExpandedCategories(new Set<string>([cats[0]]));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const grouped = useMemo(() => groupDocs(docs), [docs]);
    const categories = useMemo(() => categorizeGrouped(grouped), [grouped]);

    // Find the grouped doc for the currently selected document
    const selectedGroup = useMemo(() => {
        if (!selectedDoc) return null;
        const { baseName } = parseVersionedName(selectedDoc.name);
        return grouped.find((g) => g.baseName === baseName) || null;
    }, [selectedDoc, grouped]);

    // Current version of the selected doc
    const selectedVersion = useMemo(() => {
        if (!selectedDoc) return null;
        const { version } = parseVersionedName(selectedDoc.name);
        return version;
    }, [selectedDoc]);

    // TOC headings
    const tocHeadings = useMemo(() => {
        if (!selectedDoc) return [];
        return extractHeadings(selectedDoc.content);
    }, [selectedDoc]);

    // Breadcrumb: category > document name
    const breadcrumb = useMemo(() => {
        if (!selectedDoc || !selectedGroup) return null;
        return { category: selectedGroup.category, docName: selectedGroup.displayName };
    }, [selectedDoc, selectedGroup]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    };

    const fetchDoc = useCallback(async (path: string) => {
        setDocLoading(true);
        try {
            const doc = await docsApi.getByPath(path);
            setSelectedDoc(doc);
            contentRef.current?.scrollTo(0, 0);
            return doc;
        } catch { return null; }
        finally { setDocLoading(false); }
    }, []);

    const loadDocument = useCallback(async (path: string) => {
        const doc = await fetchDoc(path);
        if (doc) setTrail([{ path, label: path.split('/').pop() || path }]);
    }, [fetchDoc]);

    const followMdLink = useCallback(async (resolvedPath: string) => {
        const doc = await fetchDoc(resolvedPath);
        if (doc) setTrail((prev) => [...prev, { path: resolvedPath, label: resolvedPath.split('/').pop() || resolvedPath }]);
    }, [fetchDoc]);

    const navigateTrail = useCallback(async (idx: number, path: string) => {
        const doc = await fetchDoc(path);
        if (doc) setTrail((prev) => prev.slice(0, idx + 1));
    }, [fetchDoc]);

    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) { setSearchResults([]); return; }
        try {
            const results = await docsApi.search(query);
            setSearchResults(results);
        } catch { /* ignore */ }
    }, []);

    const handleVersionChange = useCallback((version: string) => {
        if (!selectedGroup) return;
        const target = selectedGroup.versions.find((v) => v.version === version);
        if (target) loadDocument(target.path);
    }, [selectedGroup, loadDocument]);

    return (
        <div className="flex h-screen">
            {/* Sidebar - Document tree */}
            <aside className="w-72 border-r border-border bg-card/50 flex flex-col" data-testid="docs-sidebar">
                <div className="p-3 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search docs..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                            data-testid="docs-search-input"
                        />
                    </div>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                    <div className="p-2 border-b border-border space-y-1">
                        {searchResults.slice(0, 10).map((r) => (
                            <button
                                key={r.path}
                                onClick={() => { setSelectedDoc(r); setSearchResults([]); setSearchQuery(''); }}
                                className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
                                data-testid={`search-result-${r.path}`}
                            >
                                <span className="font-medium text-foreground">{r.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Document tree — version-grouped */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" data-testid="docs-tree">
                    {loading ? (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-secondary rounded animate-pulse" />)}
                        </div>
                    ) : (
                        Object.entries(categories).map(([category, categoryDocs]) => (
                            <div key={category}>
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    data-testid={`doc-category-${category}`}
                                >
                                    {expandedCategories.has(category) ? (
                                        <>
                                            <ChevronDown className="w-3 h-3" />
                                            <FolderOpen className="w-3.5 h-3.5" />
                                        </>
                                    ) : (
                                        <>
                                            <ChevronRight className="w-3 h-3" />
                                            <Folder className="w-3.5 h-3.5" />
                                        </>
                                    )}
                                    <span>{category}</span>
                                    <span className="ml-auto text-[10px] opacity-50">{categoryDocs.length}</span>
                                </button>
                                {expandedCategories.has(category) && (
                                    <div className="ml-5 space-y-0.5">
                                        {categoryDocs.map((group) => {
                                            const isSelected = selectedGroup?.baseName === group.baseName;
                                            return (
                                                <button
                                                    key={group.baseName}
                                                    onClick={() => loadDocument(group.latestPath)}
                                                    className={cn(
                                                        'w-full text-left flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                                                        isSelected
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                                                    )}
                                                    data-testid={`doc-item-${group.baseName}`}
                                                >
                                                    <FileText className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{group.displayName}</span>
                                                    {group.versions.length > 1 && (
                                                        <span className="ml-auto text-[9px] opacity-50 flex-shrink-0">
                                                            {group.latestVersion}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </nav>
            </aside>

            {/* Main content - Document viewer */}
            <div ref={contentRef} className="flex-1 overflow-y-auto" data-testid="docs-content">
                {docLoading ? (
                    <div className="p-8"><div className="h-8 w-64 bg-secondary rounded animate-pulse mb-4" /><div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-4 bg-secondary rounded animate-pulse" style={{ width: `${80 - i * 15}%` }} />)}</div></div>
                ) : selectedDoc ? (
                    <div className="max-w-4xl mx-auto px-8 py-6">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center flex-wrap gap-1 text-xs text-muted-foreground mb-4" data-testid="docs-breadcrumb">
                            {breadcrumb && (
                                <>
                                    <span>{breadcrumb.category}</span>
                                    <ChevronRight className="w-3 h-3" />
                                    {trail.length <= 1 ? (
                                        <span className="text-foreground font-medium">{breadcrumb.docName}</span>
                                    ) : (
                                        <button
                                            onClick={() => navigateTrail(0, trail[0]!.path)}
                                            className="text-foreground font-medium hover:text-primary transition-colors"
                                        >
                                            {breadcrumb.docName}
                                        </button>
                                    )}
                                    {selectedVersion && trail.length <= 1 && (
                                        <>
                                            <ChevronRight className="w-3 h-3" />
                                            <span className="text-primary">{selectedVersion}</span>
                                        </>
                                    )}
                                </>
                            )}
                            {trail.slice(1).map((item, i) => {
                                const idx = i + 1;
                                return (
                                    <span key={idx} className="flex items-center gap-1">
                                        <ChevronRight className="w-3 h-3" />
                                        {idx === trail.length - 1 ? (
                                            <span className="text-primary">{item.label}</span>
                                        ) : (
                                            <button
                                                onClick={() => navigateTrail(idx, item.path)}
                                                className="hover:text-foreground transition-colors"
                                            >
                                                {item.label}
                                            </button>
                                        )}
                                    </span>
                                );
                            })}
                        </nav>

                        {/* Doc header with version selector */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{selectedDoc.name}</h1>
                                <p className="text-xs text-muted-foreground mt-1">{selectedDoc.path}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Version selector */}
                                {selectedGroup && selectedGroup.versions.length > 1 && (
                                    <select
                                        value={selectedVersion || ''}
                                        onChange={(e) => handleVersionChange(e.target.value)}
                                        className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs"
                                        data-testid="version-selector"
                                    >
                                        {selectedGroup.versions.map((v) => (
                                            <option key={v.version} value={v.version}>
                                                {v.version}{v.version === selectedGroup.versions[0]?.version ? ' (Latest)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {/* TOC toggle */}
                                <button
                                    onClick={() => setShowTOC(!showTOC)}
                                    className={cn(
                                        'p-1.5 rounded-lg border transition-colors',
                                        showTOC ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary border-border text-muted-foreground',
                                    )}
                                    title="Table of Contents"
                                    data-testid="toc-toggle"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Table of Contents */}
                        {showTOC && tocHeadings.length > 2 && (
                            <div className="mb-6 rounded-xl border border-border bg-card/50 p-4" data-testid="docs-toc">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Table of Contents</h3>
                                <nav className="space-y-0.5">
                                    {tocHeadings.filter(h => h.level <= 3).map((h, i) => (
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
                        <article className="prose prose-sm max-w-none" data-testid="doc-markdown-content">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                                components={{
                                    a({ href, children, ...props }) {
                                        const resolved = resolveRelativeMdPath(selectedDoc.path, href || '');
                                        if (resolved) {
                                            return (
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); followMdLink(resolved); }}
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

                                        // Render mermaid diagrams
                                        if (lang === 'mermaid') {
                                            return <MermaidDiagram chart={codeString} />;
                                        }

                                        // Block code (has language class)
                                        if (lang) {
                                            return (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        }

                                        // Inline code
                                        return <code className={className} {...props}>{children}</code>;
                                    },
                                    // Add IDs to headings for TOC links
                                    h1: ({ children, ...props }) => {
                                        const text = String(children);
                                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h1 id={id} {...props}>{children}</h1>;
                                    },
                                    h2: ({ children, ...props }) => {
                                        const text = String(children);
                                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h2 id={id} {...props}>{children}</h2>;
                                    },
                                    h3: ({ children, ...props }) => {
                                        const text = String(children);
                                        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                        return <h3 id={id} {...props}>{children}</h3>;
                                    },
                                }}
                            >
                                {selectedDoc.content}
                            </ReactMarkdown>
                        </article>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a document from the sidebar to view</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

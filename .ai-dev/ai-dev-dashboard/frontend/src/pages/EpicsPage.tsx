import { useState, useEffect, useCallback } from 'react';
import { epicsApi, type Epic } from '@/services/epicsApi';
import { cn } from '@/lib/utils';
import { Layers, Plus, FolderOpen, ChevronRight } from 'lucide-react';

interface Story {
    id: string;
    epicId: string;
    title: string;
    status: string;
    priority: string;
    effort: number;
}

const STATUS_COLS = [
    { key: 'pending', label: 'Pending', color: 'border-amber-500/30' },
    { key: 'in-progress', label: 'In Progress', color: 'border-blue-500/30' },
    { key: 'qa', label: 'QA', color: 'border-violet-500/30' },
    { key: 'done', label: 'Done', color: 'border-emerald-500/30' },
    { key: 'blocked', label: 'Blocked', color: 'border-red-500/30' },
];

const priorityBadge: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400',
    medium: 'bg-amber-500/15 text-amber-400',
    low: 'bg-blue-500/15 text-blue-400',
};

export function EpicsPage() {
    const [epics, setEpics] = useState<Epic[]>([]);
    const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', title: '', description: '', priority: 'medium' });

    useEffect(() => {
        loadEpics();
    }, []);

    async function loadEpics() {
        try {
            const data = await epicsApi.getAll();
            setEpics(data);
        } catch {
            /* API not ready */
        } finally {
            setLoading(false);
        }
    }

    const loadStories = useCallback(async (epicId: string) => {
        try {
            const res = await fetch(`/api/epics/${epicId}/stories`);
            if (res.ok) {
                const data = await res.json();
                setStories(data);
            }
        } catch {
            setStories([]);
        }
    }, []);

    async function handleSelectEpic(epic: Epic) {
        setSelectedEpic(epic);
        await loadStories(epic.id);
    }

    async function handleCreateEpic() {
        if (!formData.name || !formData.title) return;
        setCreating(true);
        try {
            await epicsApi.create({
                name: formData.name,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
            });
            setFormData({ name: '', title: '', description: '', priority: 'medium' });
            setShowCreate(false);
            await loadEpics();
        } catch (err) {
            console.error('Failed to create epic:', err);
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-secondary rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Epics & Stories</h1>
                            <p className="text-xs text-muted-foreground">{epics.length} epic(s)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        data-testid="create-epic-btn"
                    >
                        <Plus className="w-4 h-4" />
                        New Epic
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
                {/* Create form */}
                {showCreate && (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in" data-testid="create-epic-form">
                        <h2 className="text-md font-semibold">New Epic</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Epic Name (kebab-case)</label>
                                <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="auth-system" data-testid="epic-name-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                                <select className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" data-testid="epic-priority-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Title</label>
                                <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="Authentication System" data-testid="epic-title-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Description</label>
                                <textarea className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm resize-none" rows={2} placeholder="Epic description..." data-testid="epic-desc-input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateEpic} disabled={creating || !formData.name || !formData.title} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="epic-submit-btn">
                                {creating ? 'Creating...' : 'Create Epic'}
                            </button>
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Breadcrumb when epic selected */}
                {selectedEpic && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="epic-breadcrumb">
                        <button onClick={() => { setSelectedEpic(null); setStories([]); }} className="hover:text-foreground transition-colors">Epics</button>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-foreground font-medium">{selectedEpic.title}</span>
                    </div>
                )}

                {/* Epic detail — stories by status */}
                {selectedEpic ? (
                    <div className="grid grid-cols-5 gap-3" data-testid="epic-stories-board">
                        {STATUS_COLS.map((col) => {
                            const colStories = stories.filter((s) => s.status === col.key);
                            return (
                                <div key={col.key} className={cn('rounded-xl border bg-card/50 p-3', col.color)}>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center justify-between">
                                        {col.label}
                                        <span className="text-[10px] opacity-60">{colStories.length}</span>
                                    </h3>
                                    <div className="space-y-2">
                                        {colStories.map((story) => (
                                            <div key={story.id} className="rounded-lg border border-border bg-card p-3" data-testid={`story-card-${story.id}`}>
                                                <p className="text-xs font-semibold mb-1">{story.title}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-mono text-muted-foreground">{story.id}</span>
                                                    {story.effort > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{story.effort}pt</span>
                                                    )}
                                                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', priorityBadge[story.priority] || priorityBadge.medium)}>
                                                        {story.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {colStories.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground/50 text-center py-4">Empty</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Epic list */
                    <div className="space-y-3">
                        {epics.length === 0 && !showCreate ? (
                            <div className="text-center py-16 text-muted-foreground">
                                <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                <p className="text-sm">No epics yet. Run <code>/migrate</code> or create one manually.</p>
                            </div>
                        ) : (
                            epics.map((epic) => (
                                <div
                                    key={epic.id}
                                    onClick={() => handleSelectEpic(epic)}
                                    className="rounded-xl border border-border bg-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
                                    data-testid={`epic-card-${epic.id}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className="w-5 h-5 text-violet-400" />
                                        <div>
                                            <h3 className="text-sm font-semibold">{epic.title}</h3>
                                            <p className="text-xs text-muted-foreground">{epic.name} · {epic.storyCount} stories</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', priorityBadge[epic.priority] || priorityBadge.medium)}>
                                            {epic.priority}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { bugsApi, type Bug } from '@/services/bugsApi';
import { cn } from '@/lib/utils';
import { Bug as BugIcon, Plus, AlertTriangle } from 'lucide-react';

const severityColors: Record<string, string> = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400',
    'in-progress': 'bg-blue-500/15 text-blue-400',
    qa: 'bg-violet-500/15 text-violet-400',
    fixed: 'bg-emerald-500/15 text-emerald-400',
    wontfix: 'bg-gray-500/15 text-gray-400',
};

export function BugsPage() {
    const [bugs, setBugs] = useState<Bug[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({ name: '', title: '', severity: 'medium', description: '' });

    useEffect(() => {
        loadBugs();
    }, []);

    async function loadBugs() {
        try {
            const data = await bugsApi.getAll();
            setBugs(data);
        } catch {
            /* API not ready */
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateBug() {
        if (!formData.name || !formData.title) return;
        setCreating(true);
        try {
            await bugsApi.create({
                name: formData.name,
                title: formData.title,
                severity: formData.severity,
                description: formData.description,
            });
            setFormData({ name: '', title: '', severity: 'medium', description: '' });
            setShowCreate(false);
            await loadBugs();
        } catch (err) {
            console.error('Failed to create bug:', err);
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
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <BugIcon className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Bug Tracking</h1>
                            <p className="text-xs text-muted-foreground">{bugs.length} bug(s)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        data-testid="create-bug-btn"
                    >
                        <Plus className="w-4 h-4" />
                        Log Bug
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
                {/* Create form */}
                {showCreate && (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in" data-testid="create-bug-form">
                        <h2 className="text-md font-semibold">Log New Bug</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Bug Name (kebab-case)</label>
                                <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="token-expiry-crash" data-testid="bug-name-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Severity</label>
                                <select className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" data-testid="bug-severity-select" value={formData.severity} onChange={(e) => setFormData({ ...formData, severity: e.target.value })}>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Title</label>
                                <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="JWT token expires during active session" data-testid="bug-title-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Description</label>
                                <textarea className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm resize-none" rows={3} placeholder="Detailed description of the bug..." data-testid="bug-description-input" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateBug} disabled={creating || !formData.name || !formData.title} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="bug-submit-btn">
                                {creating ? 'Logging...' : 'Log Bug'}
                            </button>
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Bug list */}
                {bugs.length === 0 && !showCreate ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <BugIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">No bugs logged. That's a good sign! 🎉</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {bugs.map((bug) => (
                            <div key={bug.id} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer" data-testid={`bug-card-${bug.id}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-[10px] font-mono text-muted-foreground">{bug.id}</span>
                                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', severityColors[bug.severity] || severityColors.medium)}>
                                            {bug.severity}
                                        </span>
                                    </div>
                                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statusColors[bug.status] || statusColors.pending)}>
                                        {bug.status}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-foreground mb-1">{bug.title}</h3>
                                {bug.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{bug.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

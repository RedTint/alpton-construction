import { useState, useEffect } from 'react';
import { burstsApi, type Burst } from '@/services/burstsApi';
import { cn } from '@/lib/utils';
import { Zap, Plus, Clock, Activity, Battery } from 'lucide-react';

const energyColors: Record<string, string> = {
    high: 'text-emerald-400 bg-emerald-500/15',
    medium: 'text-amber-400 bg-amber-500/15',
    low: 'text-red-400 bg-red-500/15',
};

const flowColors: Record<string, string> = {
    deep: 'text-violet-400 bg-violet-500/15',
    flow: 'text-blue-400 bg-blue-500/15',
    focused: 'text-blue-400 bg-blue-500/15',
    normal: 'text-gray-400 bg-gray-500/15',
    distracted: 'text-orange-400 bg-orange-500/15',
    blocked: 'text-red-400 bg-red-500/15',
};

export function BurstPage() {
    const [bursts, setBursts] = useState<Burst[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({ focusArea: '' });

    useEffect(() => {
        loadBursts();
    }, []);

    async function loadBursts() {
        try {
            const data = await burstsApi.getAll();
            setBursts(data);
        } catch {
            /* API not ready */
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateBurst() {
        if (!formData.focusArea) return;
        setCreating(true);
        try {
            await burstsApi.create({ focusArea: formData.focusArea });
            setFormData({ focusArea: '' });
            setShowCreate(false);
            await loadBursts();
        } catch (err) {
            console.error('Failed to create burst:', err);
        } finally {
            setCreating(false);
        }
    }

    const activeBurst = bursts.find((b) => b.status === 'active');

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-secondary rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Burst Planning</h1>
                            <p className="text-xs text-muted-foreground">{bursts.length} burst(s)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        data-testid="create-burst-btn"
                    >
                        <Plus className="w-4 h-4" />
                        New Burst
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
                {/* Create form */}
                {showCreate && (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in" data-testid="create-burst-form">
                        <h2 className="text-md font-semibold">New Burst Session</h2>
                        <div>
                            <label className="block text-xs text-muted-foreground mb-1">Focus Area</label>
                            <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="Authentication deep-dive" data-testid="burst-focus-input" value={formData.focusArea} onChange={(e) => setFormData({ focusArea: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateBurst} disabled={creating || !formData.focusArea} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="burst-submit-btn">
                                {creating ? 'Creating...' : 'Start Burst'}
                            </button>
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Active burst */}
                {activeBurst && (
                    <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4" data-testid="active-burst">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary animate-pulse" />
                                <h2 className="text-md font-semibold">{activeBurst.focusArea}</h2>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{activeBurst.sessions.length} sessions</span>
                            </div>
                        </div>

                        {/* Sessions */}
                        <div className="space-y-2">
                            {activeBurst.sessions.map((session) => (
                                <div key={session.id} className="rounded-lg bg-card border border-border p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', flowColors[session.flowState] || flowColors.normal)}>
                                            {session.flowState}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{session.startedAt}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Battery className="w-3.5 h-3.5" />
                                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', energyColors[session.energyLevel] || energyColors.medium)}>
                                            {session.energyLevel}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* All bursts */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Bursts</h2>
                    {bursts.length === 0 && !showCreate ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No bursts yet. Start a focused work session.</p>
                        </div>
                    ) : (
                        bursts.map((burst) => (
                            <div key={burst.id} className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors" data-testid={`burst-card-${burst.id}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">{burst.focusArea}</h3>
                                    <span className={cn(
                                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                        burst.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground',
                                    )}>
                                        {burst.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{burst.sessions.length} sessions · {burst.stories.length} stories</p>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

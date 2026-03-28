import { useState, useEffect } from 'react';
import { sprintsApi, type Sprint } from '@/services/sprintsApi';
import { cn } from '@/lib/utils';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend,
} from 'recharts';
import { Timer, Plus, TrendingUp, Calendar } from 'lucide-react';

export function SprintPage() {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', startDate: '', endDate: '', capacityPoints: '' });

    useEffect(() => {
        loadSprints();
    }, []);

    async function loadSprints() {
        try {
            const data = await sprintsApi.getAll();
            setSprints(data);
            const active = data.find((s) => s.status === 'active') ?? null;
            setActiveSprint(active);
        } catch {
            /* API not ready */
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateSprint() {
        if (!formData.title || !formData.startDate || !formData.endDate) return;
        setCreating(true);
        try {
            await sprintsApi.create({
                title: formData.title,
                startDate: formData.startDate,
                endDate: formData.endDate,
                capacityPoints: parseInt(formData.capacityPoints) || 0,
            });
            setFormData({ title: '', startDate: '', endDate: '', capacityPoints: '' });
            setShowCreate(false);
            await loadSprints();
        } catch (err) {
            console.error('Failed to create sprint:', err);
        } finally {
            setCreating(false);
        }
    }

    // Burndown chart data
    const burndownData = activeSprint?.dailyProgress.map((dp, i) => ({
        day: `Day ${i + 1}`,
        actual: dp.pointsCompleted,
        ideal: activeSprint
            ? Math.round((activeSprint.capacityPoints / activeSprint.dailyProgress.length) * (i + 1))
            : 0,
    })) ?? [];

    // Velocity data (points per sprint)
    const velocityData = sprints.map((s) => ({
        name: s.title?.slice(0, 15) || s.id,
        points: s.dailyProgress.reduce((sum, dp) => sum + dp.pointsCompleted, 0),
    }));

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-secondary rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Timer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">Sprint Planning</h1>
                            <p className="text-xs text-muted-foreground">{sprints.length} sprint(s)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        data-testid="create-sprint-btn"
                    >
                        <Plus className="w-4 h-4" />
                        Create Sprint
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
                {/* Create form */}
                {showCreate && (
                    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fade-in" data-testid="create-sprint-form">
                        <h2 className="text-md font-semibold">New Sprint</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Sprint Name</label>
                                <input className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="Sprint 42 - Auth" data-testid="sprint-name-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Capacity (points)</label>
                                <input type="number" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" placeholder="80" data-testid="sprint-capacity-input" value={formData.capacityPoints} onChange={(e) => setFormData({ ...formData, capacityPoints: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">Start Date</label>
                                <input type="date" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" data-testid="sprint-start-input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1">End Date</label>
                                <input type="date" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" data-testid="sprint-end-input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreateSprint} disabled={creating || !formData.title} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50" data-testid="sprint-submit-btn">
                                {creating ? 'Creating...' : 'Create Sprint'}
                            </button>
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Active Sprint */}
                {activeSprint && (
                    <section className="rounded-xl border border-border bg-card p-6 space-y-4" data-testid="active-sprint">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                <h2 className="text-md font-semibold">{activeSprint.title || 'Active Sprint'}</h2>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Active</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {activeSprint.stories.length} stories · {activeSprint.capacityPoints} pts capacity
                            </span>
                        </div>

                        {/* Burndown chart */}
                        {burndownData.length > 0 && (
                            <div className="h-64" data-testid="burndown-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={burndownData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                        <Line type="monotone" dataKey="ideal" stroke="#6366f1" strokeDasharray="5 5" name="Ideal" />
                                        <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2} name="Actual" />
                                        <Legend />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </section>
                )}

                {/* Velocity Chart */}
                {velocityData.length > 0 && (
                    <section className="rounded-xl border border-border bg-card p-6 space-y-4" data-testid="velocity-section">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h2 className="text-md font-semibold">Velocity</h2>
                        </div>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={velocityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                    <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                                    <Bar dataKey="points" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}

                {/* Sprint list */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Sprints</h2>
                    {sprints.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Timer className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No sprints yet. Create your first sprint to get started.</p>
                        </div>
                    ) : (
                        sprints.map((sprint) => (
                            <div
                                key={sprint.id}
                                className={cn(
                                    'rounded-xl border border-border bg-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors',
                                    sprint.status === 'active' && 'border-primary/30 bg-primary/5',
                                )}
                                data-testid={`sprint-card-${sprint.id}`}
                                onClick={() => setActiveSprint(sprint)}
                            >
                                <div>
                                    <h3 className="text-sm font-semibold">{sprint.title || sprint.id}</h3>
                                    <p className="text-xs text-muted-foreground">{sprint.startDate} → {sprint.endDate}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{sprint.stories.length} stories</span>
                                    <span className={cn(
                                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                        sprint.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-secondary text-muted-foreground',
                                    )}>
                                        {sprint.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </div>
    );
}

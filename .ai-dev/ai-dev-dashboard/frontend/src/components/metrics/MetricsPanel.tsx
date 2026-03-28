import type { Metrics } from '@/types/board.types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import {
    BarChart3,
    CheckCircle2,
    Clock,
    Loader2,
    ShieldAlert,
    TrendingUp,
    Gauge,
    Calendar,
} from 'lucide-react';

interface MetricsPanelProps {
    metrics: Metrics;
    className?: string;
}

interface StatCardProps {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    subtext?: string;
    accent?: string;
}

function StatCard({ label, value, icon, subtext, accent }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
                <span className={cn('opacity-60 group-hover:opacity-100 transition-opacity', accent)}>
                    {icon}
                </span>
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
    );
}

export function MetricsPanel({ metrics, className }: MetricsPanelProps) {
    return (
        <div className={cn('space-y-6', className)} data-testid="metrics-panel">
            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Completion"
                    value={`${metrics.completion_pct}%`}
                    icon={<Gauge className="w-5 h-5" />}
                    subtext={`${metrics.completed} of ${metrics.total_stories} stories`}
                    accent="text-emerald-400"
                />
                <StatCard
                    label="Points Done"
                    value={metrics.total_points_completed}
                    icon={<TrendingUp className="w-5 h-5" />}
                    subtext={`${metrics.total_points_remaining} remaining`}
                    accent="text-sky-400"
                />
                <StatCard
                    label="Velocity"
                    value={`${metrics.velocity_per_sprint}/sprint`}
                    icon={<BarChart3 className="w-5 h-5" />}
                    subtext={`~${metrics.estimated_remaining_sprints} sprints left`}
                    accent="text-violet-400"
                />
                <StatCard
                    label="Stories"
                    value={metrics.total_stories}
                    icon={<Calendar className="w-5 h-5" />}
                    subtext={[
                        metrics.pending > 0 && `${metrics.pending} pending`,
                        metrics.in_progress > 0 && `${metrics.in_progress} active`,
                        metrics.blocked > 0 && `${metrics.blocked} blocked`,
                    ]
                        .filter(Boolean)
                        .join(', ')}
                    accent="text-amber-400"
                />
            </div>

            {/* Overall progress */}
            <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
                </div>
                <ProgressBar
                    value={metrics.completion_pct}
                    size="lg"
                    variant="success"
                />

                {/* Status breakdown */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span className="text-lg font-bold text-foreground tabular-nums">{metrics.completed}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Loader2 className="w-3 h-3 text-sky-400" />
                            <span className="text-lg font-bold text-foreground tabular-nums">{metrics.in_progress}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">In Progress</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span className="text-lg font-bold text-foreground tabular-nums">{metrics.pending}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <ShieldAlert className="w-3 h-3 text-red-400" />
                            <span className="text-lg font-bold text-foreground tabular-nums">{metrics.blocked}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Blocked</span>
                    </div>
                </div>
            </div>

            {/* Per-version progress */}
            <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Version Progress</h3>
                <div className="space-y-4">
                    {Object.entries(metrics.points_by_version).map(([version, data]) => (
                        <ProgressBar
                            key={version}
                            value={data.completed}
                            max={data.total}
                            label={`${version} — ${data.completed}/${data.total} pts`}
                            size="sm"
                            variant={data.pct === 100 ? 'success' : data.pct > 0 ? 'info' : 'default'}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

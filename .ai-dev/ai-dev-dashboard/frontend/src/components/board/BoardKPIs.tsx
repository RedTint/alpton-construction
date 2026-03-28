import { Metrics } from '@/types/board.types';
import { Layers, CheckCircle2, ListTodo, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BoardKPIsProps {
    metrics: Metrics;
}

export function BoardKPIs({ metrics }: BoardKPIsProps) {
    const kpis = [
        {
            label: 'Total Epics',
            value: metrics.total_epics,
            icon: Layers,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            label: 'Total Stories',
            value: metrics.total_stories,
            icon: ListTodo,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            subtext: `${metrics.completed} done`,
        },
        {
            label: 'UACs Completed',
            value: `${metrics.completed_uacs} / ${metrics.total_uacs}`,
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            subtext: metrics.total_uacs > 0 
                ? `${Math.round((metrics.completed_uacs / metrics.total_uacs) * 100)}% done`
                : 'No UACs',
        },
        {
            label: 'Points Velocity',
            value: `${metrics.completion_pct}%`,
            icon: Activity,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            subtext: `${metrics.total_points_completed} / ${metrics.total_points_completed + metrics.total_points_remaining} pts`,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                    <div 
                        key={kpi.label} 
                        className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-primary/50 transition-colors"
                    >
                        <div className={cn('p-3 rounded-lg shrink-0', kpi.bg)}>
                            <Icon className={cn('w-5 h-5', kpi.color)} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-muted-foreground truncate">{kpi.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-bold tracking-tight text-foreground truncate">{kpi.value}</h3>
                                {kpi.subtext && (
                                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                                        {kpi.subtext}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

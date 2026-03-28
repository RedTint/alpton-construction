import type { StoryStatus } from '@/types/board.types';
import { cn } from '@/lib/utils';
import { Clock, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ColumnHeaderProps {
    status: StoryStatus;
    count: number;
}

const statusConfig: Record<
    string,
    { label: string; icon: React.ReactNode; dotColor: string; bgColor: string }
> = {
    pending: {
        label: 'Pending',
        icon: <Clock className="w-4 h-4" />,
        dotColor: 'bg-amber-400',
        bgColor: 'text-amber-400',
    },
    in_progress: {
        label: 'In Progress',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        dotColor: 'bg-sky-400',
        bgColor: 'text-sky-400',
    },
    completed: {
        label: 'Completed',
        icon: <CheckCircle2 className="w-4 h-4" />,
        dotColor: 'bg-emerald-400',
        bgColor: 'text-emerald-400',
    },
    blocked: {
        label: 'Blocked',
        icon: <ShieldAlert className="w-4 h-4" />,
        dotColor: 'bg-red-400',
        bgColor: 'text-red-400',
    },
};

export function ColumnHeader({ status, count }: ColumnHeaderProps) {
    const config = statusConfig[status] ?? statusConfig['pending']!;

    return (
        <div className="flex items-center gap-2 mb-3 px-1" data-testid={`column-header-${status}`}>
            <span className={cn('shrink-0', config.bgColor)}>{config.icon}</span>
            <h2 className="text-sm font-semibold text-foreground">{config.label}</h2>
            <span className="ml-auto text-xs font-medium text-muted-foreground bg-secondary rounded-full px-2 py-0.5 tabular-nums">
                {count}
            </span>
        </div>
    );
}

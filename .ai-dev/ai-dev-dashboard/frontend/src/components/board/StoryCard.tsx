import { Badge } from '@/components/ui/Badge';
import type { Story, Priority } from '@/types/board.types';
import { cn } from '@/lib/utils';
import { Hash, Zap } from 'lucide-react';

interface StoryCardProps {
    story: Story;
    onClick: (story: Story) => void;
}

const priorityVariant: Record<Priority, 'destructive' | 'warning' | 'secondary'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary',
};

const priorityLabel: Record<Priority, string> = {
    high: 'High',
    medium: 'Med',
    low: 'Low',
};

export function StoryCard({ story, onClick }: StoryCardProps) {
    const completedUacs = story.uacs.filter((u) => u.status === 'completed').length;
    const totalUacs = story.uacs.length;

    return (
        <button
            onClick={() => onClick(story)}
            className={cn(
                'w-full text-left rounded-xl border border-border bg-card p-4',
                'hover:border-primary/40 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5',
                'transition-all duration-200 cursor-pointer group',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
            )}
            data-testid={`story-card-${story.id}`}
        >
            {/* Header row */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary tabular-nums">{story.id}</span>
                </div>
                <Badge variant={priorityVariant[story.priority]} className="text-[10px] shrink-0">
                    {priorityLabel[story.priority]}
                </Badge>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                {story.title}
            </h3>

            {/* Footer */}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="info" className="text-[10px]">
                    {story.version}
                </Badge>
                <Badge variant="purple" className="text-[10px]">
                    <Zap className="w-3 h-3 mr-0.5" />
                    {story.effort} pts
                </Badge>
                {totalUacs > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
                        {completedUacs}/{totalUacs} UACs
                    </span>
                )}
            </div>
        </button>
    );
}

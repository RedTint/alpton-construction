import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GripVertical, Hash, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Story, Priority } from '@/types/board.types';

interface DraggableStoryCardProps {
    story: Story;
    onClick: () => void;
}

const priorityVariant: Record<Priority, 'destructive' | 'warning' | 'secondary'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary',
};

export function DraggableStoryCard({ story, onClick }: DraggableStoryCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: story.id,
        data: { type: 'story', story },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const completedUacs = story.uacs.filter((u) => u.status === 'completed').length;
    const totalUacs = story.uacs.length;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group relative rounded-xl border border-border bg-card p-3 shadow-sm cursor-pointer',
                'hover:border-primary/30 hover:shadow-md transition-all duration-150',
                isDragging && 'opacity-40 shadow-xl ring-2 ring-primary/40 z-50',
            )}
            onClick={onClick}
            data-testid={`story-card-${story.id}`}
        >
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            <div className="pl-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-mono font-bold text-primary">{story.id}</span>
                    </div>
                    <Badge variant={priorityVariant[story.priority]} className="text-[10px]">
                        {story.priority}
                    </Badge>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {story.title}
                </h4>

                {/* Footer */}
                <div className="flex items-center gap-2">
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

                {/* Progress bar */}
                {totalUacs > 0 && (
                    <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary/60 rounded-full transition-all"
                            style={{ width: `${(completedUacs / totalUacs) * 100}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

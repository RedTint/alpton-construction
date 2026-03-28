import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { Story } from '@/types/board.types';
import { DraggableStoryCard } from './DraggableStoryCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    emoji: string;
    stories: Story[];
    onStoryClick: (story: Story) => void;
}

const columnColorMap: Record<string, string> = {
    pending: 'border-t-amber-500',
    in_progress: 'border-t-blue-500',
    completed: 'border-t-emerald-500',
    blocked: 'border-t-red-500',
};

export function KanbanColumn({ id, title, emoji, stories, onStoryClick }: KanbanColumnProps) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex flex-col min-w-[280px] max-w-[320px] rounded-xl border border-border bg-secondary/30 border-t-2',
                columnColorMap[id] || 'border-t-gray-500',
                isOver && 'ring-2 ring-primary/40 bg-primary/5',
            )}
            data-testid={`kanban-column-${id}`}
        >
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-base">{emoji}</span>
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {stories.length}
                </span>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
                <SortableContext items={stories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {stories.map((story) => (
                        <DraggableStoryCard
                            key={story.id}
                            story={story}
                            onClick={() => onStoryClick(story)}
                        />
                    ))}
                </SortableContext>

                {stories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-xs opacity-60">
                        No stories
                    </div>
                )}
            </div>
        </div>
    );
}

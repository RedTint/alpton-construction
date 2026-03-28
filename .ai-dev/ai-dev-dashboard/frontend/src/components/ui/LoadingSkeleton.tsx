import { cn } from '@/lib/utils';

export function LoadingSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('space-y-8 animate-fade-in', className)} data-testid="loading-skeleton">
            {/* Header skeleton */}
            <div className="space-y-3">
                <div className="skeleton h-8 w-64 rounded-lg" />
                <div className="skeleton h-4 w-96 rounded-md" />
            </div>

            {/* Metrics bar skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="skeleton h-3 w-20 rounded-md" />
                        <div className="skeleton h-8 w-16 rounded-md" />
                        <div className="skeleton h-2 w-full rounded-full" />
                    </div>
                ))}
            </div>

            {/* Board skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, col) => (
                    <div key={col} className="space-y-3">
                        <div className="skeleton h-6 w-24 rounded-md" />
                        {Array.from({ length: col === 2 ? 4 : 2 }).map((_, row) => (
                            <div
                                key={row}
                                className="rounded-xl border border-border bg-card p-4 space-y-3"
                            >
                                <div className="skeleton h-4 w-12 rounded-md" />
                                <div className="skeleton h-4 w-full rounded-md" />
                                <div className="skeleton h-3 w-3/4 rounded-md" />
                                <div className="flex gap-2">
                                    <div className="skeleton h-5 w-14 rounded-md" />
                                    <div className="skeleton h-5 w-10 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

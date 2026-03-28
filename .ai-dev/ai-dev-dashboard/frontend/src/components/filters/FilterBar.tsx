import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
    versions: string[];
    version: string;
    status: string;
    search: string;
    onVersionChange: (v: string) => void;
    onStatusChange: (s: string) => void;
    onSearchChange: (s: string) => void;
    className?: string;
}

const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
];

export function FilterBar({
    versions,
    version,
    status,
    search,
    onVersionChange,
    onStatusChange,
    onSearchChange,
    className,
}: FilterBarProps) {
    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-stretch sm:items-center gap-3',
                className,
            )}
            data-testid="filter-bar"
        >
            {/* Search */}
            <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search stories by title, ID, or category..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                    data-testid="search-input"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />

                <select
                    value={version}
                    onChange={(e) => onVersionChange(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[120px]"
                    data-testid="version-filter"
                >
                    <option value="all">All Versions</option>
                    {versions.map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer min-w-[130px]"
                    data-testid="status-filter"
                >
                    {statuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

import { Badge } from '@/components/ui/Badge';
import type { Release, Story } from '@/types/board.types';
import { cn, formatDate } from '@/lib/utils';
import { Package, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ReleasesPanel_Props {
    releases: Release[];
    stories: Story[];
    className?: string;
}

function ReleaseCard({ release, storyTitles }: { release: Release; storyTitles: Map<string, string> }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden" data-testid={`release-${release.version}`}>
            <button
                className="w-full px-5 py-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <Package className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{release.version}</span>
                        <Badge variant="info" className="text-[10px]">{release.name}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Released {formatDate(release.released_at)} · {release.stories.length} stories
                    </p>
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
            </button>

            {expanded && (
                <div className="px-5 pb-5 pt-1 space-y-4 animate-fade-in border-t border-border">
                    {/* Key achievements */}
                    {release.key_achievements.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" />
                                Key Achievements
                            </h4>
                            <ul className="space-y-1.5">
                                {release.key_achievements.map((achievement, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                                        <span className="text-emerald-400 mt-0.5">✓</span>
                                        {achievement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Stories in release */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Stories
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {release.stories.map((storyId) => (
                                <Badge key={storyId} variant="outline" className="text-[10px]">
                                    #{storyId} {storyTitles.get(storyId) && `— ${storyTitles.get(storyId)!.slice(0, 30)}...`}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ReleasesPanel({ releases, stories, className }: ReleasesPanel_Props) {
    const storyTitles = new Map(stories.map((s) => [s.id, s.title]));

    // Show releases in reverse chronological order
    const sortedReleases = [...releases].reverse();

    return (
        <div className={cn('space-y-4', className)} data-testid="releases-panel">
            <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Released Features</h2>
                <Badge variant="secondary" className="ml-1">
                    {releases.length}
                </Badge>
            </div>

            <div className="space-y-3">
                {sortedReleases.map((release) => (
                    <ReleaseCard key={release.version} release={release} storyTitles={storyTitles} />
                ))}
            </div>
        </div>
    );
}

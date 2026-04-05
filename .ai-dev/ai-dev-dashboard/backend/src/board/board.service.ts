import { Injectable, Logger } from '@nestjs/common';
import { EpicsService } from '../epics/epics.service';
import { StoriesService } from '../stories/stories.service';
import { MarkdownService } from '../common/services/markdown.service';
import { BoardData, Metrics, Release, Story, UAC } from './board.types';

@Injectable()
export class BoardService {
  private readonly logger = new Logger(BoardService.name);

  constructor(
    private readonly epicsService: EpicsService,
    private readonly storiesService: StoriesService,
    private readonly markdownService: MarkdownService,
  ) {}

  async getBoardData(): Promise<BoardData> {
    const epics = await this.epicsService.getEpics();
    const rawStories = await this.storiesService.getStories();

    let totalPoints = 0;
    let completedPoints = 0;
    let totalUacs = 0;
    let completedUacs = 0;
    let completedStories = 0;
    let inProgressStories = 0;
    let pendingStories = 0;
    let blockedStories = 0;
    
    const pointsByVersion: Record<string, { completed: number; total: number; pct: number }> = {};
    const releasesMap: Record<string, Release> = {};

    const enrichedStories: Story[] = rawStories.map((s) => {
      const parsed = this.markdownService.parseMarkdown(s.path);
      const content = parsed.content || '';
      const fm = parsed.frontmatter || {};

      const tags = fm.tags || [];
      const versionTag = tags.find((t: string) => t.startsWith('v')) || 'v1.0.0';
      const category = tags.filter((t: string) => !t.startsWith('v')).join(', ') || 'General';

      const uacs: UAC[] = [];
      const uacMatch = content.match(/## User Acceptance Criteria\s+([\s\S]*?)(?:\n## |$)/i);
      if (uacMatch) {
        const lines = uacMatch[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('- ['));
        for (const line of lines) {
          const match = line.match(/^-\s+\[( |x|X)\]\s+(.*?):\s*(.*)/i);
          if (match) {
            uacs.push({
              status: match[1].trim() ? 'completed' : 'pending',
              tag: match[2].trim(),
              description: match[3].trim(),
            });
          } else {
            const genericMatch = line.match(/^-\s+\[( |x|X)\]\s+(.*)/i);
            if (genericMatch) {
              uacs.push({
                status: genericMatch[1].trim() ? 'completed' : 'pending',
                tag: 'General',
                description: genericMatch[2].trim(),
              });
            }
          }
        }
      }

      // Map "done" status from file to "completed" for the frontend
      const mappedStatus = s.status === 'done' ? 'completed' : (s.status === 'in-progress' ? 'in_progress' : s.status);

      // We no longer blindly force UAC status here. 
      // We also read the REAL UAC counts from frontmatter (maintained by aggregate-epics.js).
      totalUacs += Number(fm.uac_total || 0);
      completedUacs += Number(fm.uac_completed || 0);

      const effort = Number(fm.story_points || fm.effort || s.effort || 0);
      totalPoints += effort;

      if (mappedStatus === 'completed') {
        completedPoints += effort;
        completedStories++;
      } else if (mappedStatus === 'in_progress') {
        inProgressStories++;
      } else if (mappedStatus === 'blocked') {
        blockedStories++;
      } else {
        pendingStories++;
      }

      if (!pointsByVersion[versionTag]) {
        pointsByVersion[versionTag] = { completed: 0, total: 0, pct: 0 };
        
        let releaseName = `Release ${versionTag}`;
        let releasedAt = '';
        const keyAchievements: string[] = [];
        
        try {
          // Use the exact regex pattern as in Stories/Epics to get the base path reliably
          const basePathMatch = __dirname.match(/(.*\.ai-dev-dashboard\/backend)(?:\/dist|\/src|$)/);
          const basePath = basePathMatch ? basePathMatch[1] : process.cwd();
          // Since the API runs inside backend directory, docs is at ../../docs from backend root
          const docsPath = process.env.DOCS_PATH || require('path').join(basePath, '../../../docs');
          
          const releasePath = require('path').join(docsPath, 'releases', `release-${versionTag}.md`);
          const fs = require('fs');
          if (fs.existsSync(releasePath)) {
            const releaseCode = fs.readFileSync(releasePath, 'utf-8');
            
            // Extract Date: "**Release Date:** March 2, 2026"
            const dateMatch = releaseCode.match(/\*\*Release Date:\*\*\s*(.+)/i);
            if (dateMatch) {
              releasedAt = dateMatch[1].trim();
            }
            
            // Extract Highlights list under "## Summary" / "## Highlights"
            const highlightsMatch = releaseCode.match(/\*\*Highlights:\*\*\s*\n([\s\S]*?)(?:\n---|\n##)/i);
            if (highlightsMatch) {
              const items = highlightsMatch[1].split('\n').map(l => l.trim()).filter(l => l.match(/^- /));
              // push up to 5 highlights
              items.slice(0, 5).forEach(item => {
                // Remove the initial '- ' and any emoji shortcuts
                keyAchievements.push(item.replace(/^- (?:[\u1000-\uFFFF] )?/, '').replace(/\*\*/g, ''));
              });
            }
          }
        } catch (e) {
          this.logger.warn(`Could not read release notes for ${versionTag}`, e);
        }

        releasesMap[versionTag] = {
          version: versionTag,
          name: releaseName,
          released_at: releasedAt,
          key_achievements: keyAchievements,
          stories: [],
        };
      }
      pointsByVersion[versionTag].total += effort;
      if (mappedStatus === 'completed') {
        pointsByVersion[versionTag].completed += effort;
        releasesMap[versionTag].stories.push(s.id);
      }

      const descMatch = content.match(/## Description\s+([\s\S]*?)(?:\n## |$)/i);
      const extractedDesc = descMatch ? descMatch[1].trim() : (fm.description || s.description || '');

      return {
        id: s.id,
        title: s.title,
        description: extractedDesc,
        status: mappedStatus,
        priority: s.priority,
        effort,
        version: versionTag,
        category,
        dependencies: fm.dependencies || [],
        uacs,
        notes: fm.notes || '',
      };
    });

    for (const v in pointsByVersion) {
      if (pointsByVersion[v].total > 0) {
        pointsByVersion[v].pct = Math.round((pointsByVersion[v].completed / pointsByVersion[v].total) * 100);
      }
    }

    const completion_pct = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    const metrics: Metrics = {
      total_epics: epics.length,
      total_stories: enrichedStories.length,
      completed: completedStories,
      in_progress: inProgressStories,
      pending: pendingStories,
      blocked: blockedStories,
      total_uacs: totalUacs,
      completed_uacs: completedUacs,
      completion_pct: completion_pct,
      total_points_completed: completedPoints,
      total_points_remaining: totalPoints - completedPoints,
      points_by_version: pointsByVersion,
      velocity_per_sprint: 0,
      estimated_remaining_sprints: 0,
      suggestions: [],
    };

    return {
      metadata: {
        generated_at: new Date().toISOString(),
        atomic_stories_version: 'v1.6.0',
        progress_version: 'v1.6.0',
        total_stories: metrics.total_stories,
        overall_completion_pct: metrics.completion_pct,
      },
      stories: enrichedStories,
      releases: Object.values(releasesMap).filter(r => r.released_at !== ''),
      metrics,
    };
  }

  async getStories(version?: string, status?: string): Promise<Story[]> {
    const board = await this.getBoardData();
    let stories = board.stories;
    if (version) stories = stories.filter((s) => s.version === version);
    if (status) stories = stories.filter((s) => s.status === status);
    return stories;
  }

  async getReleases(): Promise<Release[]> {
    const board = await this.getBoardData();
    return board.releases;
  }

  async getMetrics(): Promise<Metrics> {
    const board = await this.getBoardData();
    return board.metrics;
  }
}

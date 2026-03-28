import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { EpicsService } from '../epics/epics.service';
import { StoriesService } from '../stories/stories.service';
import { MarkdownService } from '../common/services/markdown.service';

const mockEpics = [
  { id: '001', name: 'MVP', title: 'MVP', description: '', priority: 'high', status: 'active', storyCount: 1, path: '/epics/001' }
];

const mockRawStories = [
  { id: '001.001', epicId: '001', title: 'Story One', description: 'Desc', status: 'completed', priority: 'high', effort: 3, path: '/epics/001/done/001.001-story-one.md' },
  { id: '001.002', epicId: '001', title: 'Story Two', description: 'Desc', status: 'pending', priority: 'medium', effort: 5, path: '/epics/001/pending/001.002-story-two.md' },
];

describe('BoardService', () => {
  let service: BoardService;
  let epicsService: EpicsService;
  let storiesService: StoriesService;
  let markdownService: MarkdownService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: EpicsService,
          useValue: { getEpics: jest.fn().mockResolvedValue(mockEpics) },
        },
        {
          provide: StoriesService,
          useValue: { getStories: jest.fn().mockResolvedValue(mockRawStories) },
        },
        {
          provide: MarkdownService,
          useValue: {
            parseMarkdown: jest.fn((path: string) => {
              if (path.includes('done')) {
                return {
                  content: "## User Acceptance Criteria\n\n- [x] CLI: Do thing\n- [ ] CLI: Do another thing",
                  frontmatter: { version: 'v1.0.0', tags: ['v1.0.0', 'backend'] },
                };
              }
              return {
                content: "## User Acceptance Criteria\n\n- [ ] CLI: Pending UAC",
                frontmatter: { version: 'v1.4.0', tags: ['v1.4.0', 'frontend'] },
              };
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BoardService>(BoardService);
    epicsService = module.get<EpicsService>(EpicsService);
    storiesService = module.get<StoriesService>(StoriesService);
    markdownService = module.get<MarkdownService>(MarkdownService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBoardData()', () => {
    it('aggregates data correctly from services', async () => {
      const result = await service.getBoardData();
      
      expect(result.stories).toHaveLength(2);
      expect(result.stories[0].uacs).toHaveLength(2);
      expect(result.stories[0].uacs[0].status).toBe('completed');
      expect(result.stories[0].version).toBe('v1.0.0');

      expect(result.metrics.total_stories).toBe(2);
      expect(result.metrics.completed).toBe(1);
      expect(result.metrics.pending).toBe(1);
      expect(result.metrics.total_points_completed).toBe(3);
      expect(result.metrics.total_points_remaining).toBe(5);
      expect(result.metrics.total_uacs).toBe(3);
      expect(result.metrics.completed_uacs).toBe(1);
    });
  });

  describe('getStories()', () => {
    it('filters by version correctly', async () => {
      const result = await service.getStories('v1.0.0');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('001.001');
    });

    it('filters by status correctly', async () => {
      const result = await service.getStories(undefined, 'pending');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('001.002');
    });
  });

  describe('getMetrics()', () => {
    it('returns the metrics object', async () => {
      const result = await service.getMetrics();
      expect(result.total_stories).toBe(2);
      expect(result.completed_uacs).toBe(1);
    });
  });
});

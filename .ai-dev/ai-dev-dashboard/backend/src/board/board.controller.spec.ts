import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardData, Metrics, Release, Story } from './board.types';

const mockStories: Story[] = [
  {
    id: '001',
    title: 'Story One',
    description: 'Desc',
    status: 'completed',
    priority: 'high',
    effort: 3,
    version: 'v1.0.0',
    category: 'MVP',
    dependencies: [],
    uacs: [],
    notes: '',
  },
];

const mockReleases: Release[] = [
  {
    version: 'v1.0.0',
    name: 'MVP',
    released_at: '2026-02-06',
    stories: ['001'],
    key_achievements: ['Initial release'],
  },
];

const mockMetrics: Metrics = {
  total_epics: 7,
  total_stories: 30,
  completed: 24,
  in_progress: 0,
  pending: 6,
  blocked: 0,
  total_uacs: 100,
  completed_uacs: 50,
  completion_pct: 80,
  total_points_completed: 100,
  total_points_remaining: 20,
  points_by_version: {
    'v1.0.0': { completed: 50, total: 50, pct: 100 },
  },
  velocity_per_sprint: 26,
  estimated_remaining_sprints: 1,
  suggestions: [],
};

const mockBoardData: BoardData = {
  metadata: {
    generated_at: '2026-02-19T00:00:00Z',
    atomic_stories_version: 'v1.4.0',
    progress_version: 'v1.3.0',
    total_stories: 1,
    overall_completion_pct: 100,
  },
  stories: mockStories,
  releases: mockReleases,
  metrics: mockMetrics,
};

const mockBoardService = {
  getBoardData: jest.fn().mockResolvedValue(mockBoardData),
  getStories: jest.fn().mockResolvedValue(mockStories),
  getReleases: jest.fn().mockResolvedValue(mockReleases),
  getMetrics: jest.fn().mockResolvedValue(mockMetrics),
};

describe('BoardController', () => {
  let controller: BoardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [{ provide: BoardService, useValue: mockBoardService }],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    jest.clearAllMocks();
    mockBoardService.getBoardData.mockResolvedValue(mockBoardData);
    mockBoardService.getStories.mockResolvedValue(mockStories);
    mockBoardService.getReleases.mockResolvedValue(mockReleases);
    mockBoardService.getMetrics.mockResolvedValue(mockMetrics);
  });

  it('getBoardData() delegates to service', async () => {
    const result = await controller.getBoardData();
    expect(mockBoardService.getBoardData).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockBoardData);
  });

  it('getStories() passes query params to service', async () => {
    await controller.getStories('v1.0.0', 'completed');
    expect(mockBoardService.getStories).toHaveBeenCalledWith('v1.0.0', 'completed');
  });

  it('getStories() works with no params', async () => {
    await controller.getStories();
    expect(mockBoardService.getStories).toHaveBeenCalledWith(undefined, undefined);
  });

  it('getReleases() delegates to service', async () => {
    const result = await controller.getReleases();
    expect(mockBoardService.getReleases).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockReleases);
  });

  it('getMetrics() delegates to service', async () => {
    const result = await controller.getMetrics();
    expect(mockBoardService.getMetrics).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockMetrics);
  });
});

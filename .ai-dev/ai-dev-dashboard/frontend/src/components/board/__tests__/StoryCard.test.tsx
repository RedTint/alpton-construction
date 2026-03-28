import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoryCard } from '@/components/board/StoryCard';
import { mockBoardData } from '@/test/mocks';

describe('StoryCard', () => {
    const story = mockBoardData.stories[0]!;
    const onClick = vi.fn();

    it('renders story ID', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText(story.id)).toBeInTheDocument();
    });

    it('renders story title', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText(story.title)).toBeInTheDocument();
    });

    it('renders version badge', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText(story.version)).toBeInTheDocument();
    });

    it('renders effort points', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText(`${story.effort} pts`)).toBeInTheDocument();
    });

    it('renders UAC count when UACs exist', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText('2/2 UACs')).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup();
        render(<StoryCard story={story} onClick={onClick} />);
        await user.click(screen.getByTestId(`story-card-${story.id}`));
        expect(onClick).toHaveBeenCalledWith(story);
    });

    it('renders priority badge', () => {
        render(<StoryCard story={story} onClick={onClick} />);
        expect(screen.getByText('High')).toBeInTheDocument();
    });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoryDetailPanel } from '@/components/board/StoryDetailPanel';
import { mockBoardData } from '@/test/mocks';

describe('StoryDetailPanel', () => {
    const story = mockBoardData.stories[2]!; // in_progress story with UACs
    const onClose = vi.fn();

    it('renders story title', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText(story.title)).toBeInTheDocument();
    });

    it('renders story ID', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText(story.id)).toBeInTheDocument();
    });

    it('renders status badge', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('renders description', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText(story.description)).toBeInTheDocument();
    });

    it('renders UACs grouped by tag', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText('Generates React components')).toBeInTheDocument();
        expect(screen.getByText('Creates test files')).toBeInTheDocument();
        expect(screen.getByText('Reads documentation context')).toBeInTheDocument();
    });

    it('shows UAC count', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('renders dependencies', () => {
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        expect(screen.getByText('#001')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
        const user = userEvent.setup();
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        await user.click(screen.getByTestId('close-panel'));
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop clicked', async () => {
        const user = userEvent.setup();
        render(<StoryDetailPanel story={story} onClose={onClose} />);
        await user.click(screen.getByTestId('panel-backdrop'));
        expect(onClose).toHaveBeenCalled();
    });
});

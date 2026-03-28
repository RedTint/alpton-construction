import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoardView } from '@/components/board/BoardView';
import { mockBoardData } from '@/test/mocks';

describe('BoardView', () => {
    const onStoryClick = vi.fn();

    it('renders all four column headers', () => {
        render(<BoardView stories={mockBoardData.stories} onStoryClick={onStoryClick} />);
        expect(screen.getByTestId('column-header-pending')).toBeInTheDocument();
        expect(screen.getByTestId('column-header-in_progress')).toBeInTheDocument();
        expect(screen.getByTestId('column-header-completed')).toBeInTheDocument();
        expect(screen.getByTestId('column-header-blocked')).toBeInTheDocument();
    });

    it('groups stories by status', () => {
        render(<BoardView stories={mockBoardData.stories} onStoryClick={onStoryClick} />);
        // 2 completed, 1 in progress, 1 pending, 1 blocked
        expect(screen.getByTestId('story-card-001')).toBeInTheDocument();
        expect(screen.getByTestId('story-card-002')).toBeInTheDocument();
        expect(screen.getByTestId('story-card-101')).toBeInTheDocument();
        expect(screen.getByTestId('story-card-310')).toBeInTheDocument();
        expect(screen.getByTestId('story-card-311')).toBeInTheDocument();
    });

    it('shows correct counts in column headers', () => {
        render(<BoardView stories={mockBoardData.stories} onStoryClick={onStoryClick} />);
        // Find the count badges within headers
        const completedHeader = screen.getByTestId('column-header-completed');
        expect(completedHeader).toHaveTextContent('2');
    });

    it('shows empty state for columns with no stories', () => {
        render(<BoardView stories={[]} onStoryClick={onStoryClick} />);
        const emptyMessages = screen.getAllByText('No stories');
        expect(emptyMessages.length).toBe(4);
    });
});

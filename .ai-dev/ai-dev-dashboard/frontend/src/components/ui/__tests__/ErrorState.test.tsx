import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from '@/components/ui/ErrorState';

describe('ErrorState', () => {
    it('renders error message', () => {
        render(<ErrorState message="Something broke" />);
        expect(screen.getByText('Something broke')).toBeInTheDocument();
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows 503 specific content and sync-board instructions', () => {
        render(<ErrorState message="Board data not generated" is503 />);
        expect(screen.getByText('Board Data Not Available')).toBeInTheDocument();
        expect(screen.getByText('/sync-board')).toBeInTheDocument();
        expect(screen.getByText('Quick Fix')).toBeInTheDocument();
    });

    it('renders retry button when onRetry provided', () => {
        const onRetry = () => { };
        render(<ErrorState message="Error" onRetry={onRetry} />);
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    it('hides retry button when no onRetry', () => {
        render(<ErrorState message="Error" />);
        expect(screen.queryByTestId('retry-button')).not.toBeInTheDocument();
    });
});

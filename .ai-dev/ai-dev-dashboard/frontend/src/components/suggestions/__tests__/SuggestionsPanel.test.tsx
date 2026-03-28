import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuggestionsPanel } from '@/components/suggestions/SuggestionsPanel';
import { mockBoardData } from '@/test/mocks';

describe('SuggestionsPanel', () => {
    const { suggestions } = mockBoardData.metrics;

    it('renders suggestions heading', () => {
        render(<SuggestionsPanel suggestions={suggestions} />);
        expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });

    it('renders suggestion count', () => {
        render(<SuggestionsPanel suggestions={suggestions} />);
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders suggestion titles', () => {
        render(<SuggestionsPanel suggestions={suggestions} />);
        expect(screen.getByText('Story 310 is ready to start')).toBeInTheDocument();
        expect(screen.getByText('Story 311 is high-value')).toBeInTheDocument();
    });

    it('renders suggestion details', () => {
        render(<SuggestionsPanel suggestions={suggestions} />);
        expect(screen.getByText('No unmet dependencies. High priority.')).toBeInTheDocument();
    });

    it('renders type badges', () => {
        render(<SuggestionsPanel suggestions={suggestions} />);
        expect(screen.getByText('Available')).toBeInTheDocument();
        expect(screen.getByText('High Value')).toBeInTheDocument();
    });

    it('returns null when no suggestions', () => {
        const { container } = render(<SuggestionsPanel suggestions={[]} />);
        expect(container.firstChild).toBeNull();
    });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsPanel } from '@/components/metrics/MetricsPanel';
import { mockBoardData } from '@/test/mocks';

describe('MetricsPanel', () => {
    const { metrics } = mockBoardData;

    it('renders overall completion percentage', () => {
        render(<MetricsPanel metrics={metrics} />);
        const matches = screen.getAllByText('60%');
        expect(matches.length).toBeGreaterThanOrEqual(1);
    });

    it('renders total points completed', () => {
        render(<MetricsPanel metrics={metrics} />);
        expect(screen.getByText('11')).toBeInTheDocument();
    });

    it('renders velocity', () => {
        render(<MetricsPanel metrics={metrics} />);
        expect(screen.getByText('10/sprint')).toBeInTheDocument();
    });

    it('renders story counts', () => {
        render(<MetricsPanel metrics={metrics} />);
        expect(screen.getByText('5')).toBeInTheDocument(); // total stories
    });

    it('renders status breakdown', () => {
        render(<MetricsPanel metrics={metrics} />);
        expect(screen.getByText('2')).toBeInTheDocument(); // completed
    });

    it('renders version progress bars', () => {
        render(<MetricsPanel metrics={metrics} />);
        expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
        expect(screen.getByText(/v1\.1\.0/)).toBeInTheDocument();
        expect(screen.getByText(/v1\.4\.0/)).toBeInTheDocument();
    });
});

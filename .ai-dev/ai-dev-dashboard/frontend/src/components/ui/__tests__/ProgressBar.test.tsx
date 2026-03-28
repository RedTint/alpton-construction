import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/ui/ProgressBar';

describe('ProgressBar', () => {
    it('renders with correct percentage', () => {
        render(<ProgressBar value={75} />);
        expect(screen.getByText('75%')).toBeInTheDocument();
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuenow', '75');
    });

    it('calculates percentage from value and max', () => {
        render(<ProgressBar value={3} max={10} />);
        expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('renders label', () => {
        render(<ProgressBar value={50} label="Progress" />);
        expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('hides percentage when showPercentage is false', () => {
        render(<ProgressBar value={50} showPercentage={false} />);
        expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('caps at 100%', () => {
        render(<ProgressBar value={150} max={100} />);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles zero max gracefully', () => {
        render(<ProgressBar value={0} max={0} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
    });
});

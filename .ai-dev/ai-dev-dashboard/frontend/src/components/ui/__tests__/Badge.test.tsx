import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
    it('renders with text content', () => {
        render(<Badge>Test Badge</Badge>);
        expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
        const { container } = render(<Badge variant="success">Completed</Badge>);
        const badge = container.querySelector('[data-testid="badge"]');
        expect(badge).toHaveClass('text-emerald-400');
    });

    it('renders default variant', () => {
        const { container } = render(<Badge>Default</Badge>);
        const badge = container.querySelector('[data-testid="badge"]');
        expect(badge).toHaveClass('text-primary');
    });

    it('passes additional className', () => {
        const { container } = render(<Badge className="custom-class">Extra</Badge>);
        const badge = container.querySelector('[data-testid="badge"]');
        expect(badge).toHaveClass('custom-class');
    });
});

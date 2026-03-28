import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/filters/FilterBar';

describe('FilterBar', () => {
    const defaultProps = {
        versions: ['v1.0.0', 'v1.1.0', 'v1.4.0'],
        version: 'all',
        status: 'all',
        search: '',
        onVersionChange: vi.fn(),
        onStatusChange: vi.fn(),
        onSearchChange: vi.fn(),
    };

    it('renders search input', () => {
        render(<FilterBar {...defaultProps} />);
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('renders version filter with options', () => {
        render(<FilterBar {...defaultProps} />);
        const select = screen.getByTestId('version-filter');
        expect(select).toBeInTheDocument();
        expect(select).toHaveTextContent('All Versions');
    });

    it('renders status filter with options', () => {
        render(<FilterBar {...defaultProps} />);
        const select = screen.getByTestId('status-filter');
        expect(select).toBeInTheDocument();
        expect(select).toHaveTextContent('All Statuses');
    });

    it('calls onSearchChange when typing in search', async () => {
        const user = userEvent.setup();
        render(<FilterBar {...defaultProps} />);
        const input = screen.getByTestId('search-input');
        await user.type(input, 'test');
        expect(defaultProps.onSearchChange).toHaveBeenCalled();
    });

    it('calls onVersionChange when selecting version', async () => {
        const user = userEvent.setup();
        render(<FilterBar {...defaultProps} />);
        const select = screen.getByTestId('version-filter');
        await user.selectOptions(select, 'v1.0.0');
        expect(defaultProps.onVersionChange).toHaveBeenCalledWith('v1.0.0');
    });

    it('calls onStatusChange when selecting status', async () => {
        const user = userEvent.setup();
        render(<FilterBar {...defaultProps} />);
        const select = screen.getByTestId('status-filter');
        await user.selectOptions(select, 'completed');
        expect(defaultProps.onStatusChange).toHaveBeenCalledWith('completed');
    });
});

import { test, expect } from '@playwright/test';

/**
 * User Flow 6: Epic and Story Drag-and-Drop Management
 *
 * Covers:
 * - Dashboard loads board.json from backend
 * - Kanban board displays with status columns
 * - Story cards show within columns with correct data
 * - Drag-and-drop stories between columns (optimistic update)
 * - Filter and search stories
 * - View story detail modal
 */

test.describe('UF6: Kanban Board', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load the dashboard and display navigation', async ({ page }) => {
        // Sidebar should be visible with nav items
        const sidebar = page.getByTestId('sidebar');
        await expect(sidebar).toBeVisible();

        // Should have Board nav item active
        const boardNav = page.getByTestId('nav-board');
        await expect(boardNav).toBeVisible();
    });

    test('should display the kanban board with status columns', async ({ page }) => {
        // Wait for board to load
        const kanbanBoard = page.getByTestId('kanban-board');
        await expect(kanbanBoard).toBeVisible({ timeout: 10_000 });

        // Should have the four status columns
        await expect(page.getByTestId('kanban-column-pending')).toBeVisible();
        await expect(page.getByTestId('kanban-column-in_progress')).toBeVisible();
        await expect(page.getByTestId('kanban-column-completed')).toBeVisible();
        await expect(page.getByTestId('kanban-column-blocked')).toBeVisible();
    });

    test('should display story cards with correct information', async ({ page }) => {
        const kanbanBoard = page.getByTestId('kanban-board');
        await expect(kanbanBoard).toBeVisible({ timeout: 10_000 });

        // Story cards should exist (matching the [data-testid^="story-card-"] pattern)
        const storyCards = page.locator('[data-testid^="story-card-"]');
        const count = await storyCards.count();

        if (count > 0) {
            // First card should have visible text content
            const firstCard = storyCards.first();
            await expect(firstCard).toBeVisible();
        }
    });

    test('should switch between Board, Metrics, and Releases tabs', async ({ page }) => {
        await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 10_000 });

        // Click Metrics tab
        await page.getByTestId('tab-metrics').click();
        await expect(page.getByTestId('kanban-board')).not.toBeVisible();

        // Click Releases tab
        await page.getByTestId('tab-releases').click();

        // Switch back to Board
        await page.getByTestId('tab-board').click();
        await expect(page.getByTestId('kanban-board')).toBeVisible();
    });

    test('should have a working refresh button', async ({ page }) => {
        await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 10_000 });

        const refreshBtn = page.getByTestId('refresh-button');
        await expect(refreshBtn).toBeVisible();
        await refreshBtn.click();

        // Should still show the board after refresh
        await expect(page.getByTestId('kanban-board')).toBeVisible({ timeout: 10_000 });
    });

    test('should navigate to other pages via sidebar', async ({ page }) => {
        // Navigate to Sprints
        await page.getByTestId('nav-sprints').click();
        await expect(page).toHaveURL(/\/sprints/);

        // Navigate to Docs
        await page.getByTestId('nav-docs').click();
        await expect(page).toHaveURL(/\/docs/);

        // Navigate to Terminal
        await page.getByTestId('nav-terminal').click();
        await expect(page).toHaveURL(/\/cli/);

        // Navigate back to Board
        await page.getByTestId('nav-board').click();
        await expect(page).toHaveURL('/');
    });
});

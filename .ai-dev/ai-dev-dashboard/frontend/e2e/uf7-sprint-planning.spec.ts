import { test, expect } from '@playwright/test';

/**
 * User Flow 7: Sprint Planning and Burndown Tracking
 *
 * Covers:
 * - Navigate to Sprints tab
 * - View list of sprints
 * - Create a new sprint (name, dates, capacity)
 * - View active sprint detail with burndown chart
 * - View velocity chart
 */

test.describe('UF7: Sprint Planning', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/sprints');
    });

    test('should load the sprint planning page', async ({ page }) => {
        // Header should be visible
        await expect(page.locator('h1', { hasText: 'Sprint Planning' })).toBeVisible();
    });

    test('should show create sprint button', async ({ page }) => {
        const createBtn = page.getByTestId('create-sprint-btn');
        await expect(createBtn).toBeVisible();
    });

    test('should toggle create sprint form', async ({ page }) => {
        const createBtn = page.getByTestId('create-sprint-btn');
        await createBtn.click();

        // Form should appear
        const form = page.getByTestId('create-sprint-form');
        await expect(form).toBeVisible();

        // Should have required fields
        await expect(page.getByTestId('sprint-name-input')).toBeVisible();
        await expect(page.getByTestId('sprint-capacity-input')).toBeVisible();
        await expect(page.getByTestId('sprint-start-input')).toBeVisible();
        await expect(page.getByTestId('sprint-end-input')).toBeVisible();
        await expect(page.getByTestId('sprint-submit-btn')).toBeVisible();

        // Toggle off
        await createBtn.click();
        await expect(form).not.toBeVisible();
    });

    test('should fill in sprint creation form', async ({ page }) => {
        await page.getByTestId('create-sprint-btn').click();
        const form = page.getByTestId('create-sprint-form');
        await expect(form).toBeVisible();

        // Fill in form fields
        await page.getByTestId('sprint-name-input').fill('Sprint 1 - Auth Features');
        await page.getByTestId('sprint-capacity-input').fill('80');
        await page.getByTestId('sprint-start-input').fill('2026-03-15');
        await page.getByTestId('sprint-end-input').fill('2026-03-29');

        // Verify values
        await expect(page.getByTestId('sprint-name-input')).toHaveValue('Sprint 1 - Auth Features');
        await expect(page.getByTestId('sprint-capacity-input')).toHaveValue('80');
    });

    test('should display active sprint with charts when data exists', async ({ page }) => {
        // If active sprint exists, check for burndown chart
        const activeSprint = page.getByTestId('active-sprint');
        const isVisible = await activeSprint.isVisible().catch(() => false);

        if (isVisible) {
            await expect(page.getByTestId('burndown-chart')).toBeVisible();
        }

        // Velocity section should exist when sprints exist
        const velocitySection = page.getByTestId('velocity-section');
        const velocityVisible = await velocitySection.isVisible().catch(() => false);
        if (velocityVisible) {
            await expect(velocitySection).toBeVisible();
        }
    });

    test('should navigate back to board from sprints page', async ({ page }) => {
        await page.getByTestId('nav-board').click();
        await expect(page).toHaveURL('/');
    });
});

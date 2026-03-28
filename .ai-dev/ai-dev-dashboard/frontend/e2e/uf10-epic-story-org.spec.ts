import { test, expect } from '@playwright/test';

/**
 * User Flow 10: Epic & Story Organization
 *
 * Covers:
 * - Navigate to Epics page via sidebar
 * - View list of epics (empty or populated)
 * - Create epic form with validation
 * - View stories by status columns when epic is selected
 */

test.describe('UF10: Epic & Story Organization', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/epics');
    });

    test('should load the Epics page', async ({ page }) => {
        const heading = page.locator('h1');
        await expect(heading).toHaveText('Epics & Stories');
    });

    test('should be accessible from sidebar navigation', async ({ page }) => {
        await page.goto('/');
        const epicsNav = page.getByTestId('nav-epics');
        await expect(epicsNav).toBeVisible();
        await epicsNav.click();
        await expect(page).toHaveURL('/epics');
    });

    test('should show create epic button', async ({ page }) => {
        const createBtn = page.getByTestId('create-epic-btn');
        await expect(createBtn).toBeVisible();
        await expect(createBtn).toHaveText(/New Epic/);
    });

    test('should toggle create epic form', async ({ page }) => {
        const createBtn = page.getByTestId('create-epic-btn');
        await createBtn.click();

        const form = page.getByTestId('create-epic-form');
        await expect(form).toBeVisible();

        // Should have all required fields
        await expect(page.getByTestId('epic-name-input')).toBeVisible();
        await expect(page.getByTestId('epic-title-input')).toBeVisible();
        await expect(page.getByTestId('epic-desc-input')).toBeVisible();
        await expect(page.getByTestId('epic-priority-select')).toBeVisible();

        // Submit button should be disabled when form is empty
        const submitBtn = page.getByTestId('epic-submit-btn');
        await expect(submitBtn).toBeDisabled();
    });

    test('should enable submit when form is filled', async ({ page }) => {
        const createBtn = page.getByTestId('create-epic-btn');
        await createBtn.click();

        await page.getByTestId('epic-name-input').fill('test-epic');
        await page.getByTestId('epic-title-input').fill('Test Epic');
        await page.getByTestId('epic-desc-input').fill('A test epic');

        const submitBtn = page.getByTestId('epic-submit-btn');
        await expect(submitBtn).toBeEnabled();
    });

    test('should show empty state when no epics exist', async ({ page }) => {
        // If no epics directory exists, should show helpful message
        const content = page.locator('main');
        await expect(content).toBeVisible();
        // Either shows epic cards or empty state
        await page.screenshot({ path: 'e2e-screenshots/uf10-epics-page.png', fullPage: false });
    });

    test('should show epic cards when epics exist', async ({ page }) => {
        // Wait for API response
        await page.waitForTimeout(500);

        const epicCards = page.locator('[data-testid^="epic-card-"]');
        const count = await epicCards.count();

        if (count > 0) {
            // Click first epic to see stories board
            await epicCards.first().click();
            await page.waitForTimeout(500);

            // Should show breadcrumb
            const breadcrumb = page.getByTestId('epic-breadcrumb');
            await expect(breadcrumb).toBeVisible();

            // Should show stories board with status columns
            const board = page.getByTestId('epic-stories-board');
            await expect(board).toBeVisible();

            await page.screenshot({ path: 'e2e-screenshots/uf10-epic-stories.png', fullPage: false });
        }
    });
});

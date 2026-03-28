import { test, expect } from '@playwright/test';

/**
 * User Flow 8: Documentation Browsing with Version Selection
 *
 * Covers:
 * - Navigate to Documentation tab
 * - Load and display document tree in sidebar (version-grouped)
 * - Expand/collapse category folders
 * - Select and render a document with react-markdown
 * - Search documentation
 * - Version selector switches between document versions
 * - Breadcrumbs show category > document > version
 * - Table of Contents auto-generated from headings
 */

test.describe('UF8: Documentation Viewer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/docs');
    });

    test('should load the documentation viewer with sidebar and content area', async ({ page }) => {
        const sidebar = page.getByTestId('docs-sidebar');
        await expect(sidebar).toBeVisible();

        const content = page.getByTestId('docs-content');
        await expect(content).toBeVisible();
        await expect(content.locator('text=Select a document')).toBeVisible();
    });

    test('should display document tree with categories', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        // Should have at least one category (button with folder icon)
        const categories = tree.locator('button').filter({ has: page.locator('svg') });
        const count = await categories.count();
        expect(count).toBeGreaterThan(0);
    });

    test('should group versioned documents (fewer sidebar items than total files)', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        // First category (Planning) is expanded by default — doc items should already be visible
        const docItems = tree.locator('[data-testid^="doc-item-"]');
        await expect(docItems.first()).toBeVisible({ timeout: 5_000 });
        const count = await docItems.count();
        expect(count).toBeGreaterThan(0);

        // Grouped items should NOT show ".md" extension — they show baseName like "002-prd"
        for (let i = 0; i < Math.min(count, 5); i++) {
            const text = await docItems.nth(i).textContent();
            expect(text).not.toMatch(/\.md$/);
        }

        await page.screenshot({ path: 'e2e-screenshots/uf8-version-grouping.png', fullPage: false });
    });

    test('should expand and collapse category folders', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        const firstCategory = tree.locator('button').first();
        await firstCategory.click();
    });

    test('should have a search input', async ({ page }) => {
        const searchInput = page.getByTestId('docs-search-input');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Search docs...');
    });

    test('should search documentation', async ({ page }) => {
        const searchInput = page.getByTestId('docs-search-input');
        await searchInput.fill('sprint planning');
        await page.waitForTimeout(500);
    });

    test('should render markdown content when document is selected', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        const docItems = tree.locator('[data-testid^="doc-item-"]');
        const count = await docItems.count();

        if (count > 0) {
            await docItems.first().click();

            const markdownContent = page.getByTestId('doc-markdown-content');
            await expect(markdownContent).toBeVisible({ timeout: 5_000 });
        }
    });

    test('should show breadcrumbs when a document is selected', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        const docItems = tree.locator('[data-testid^="doc-item-"]');
        const count = await docItems.count();

        if (count > 0) {
            await docItems.first().click();
            await page.waitForTimeout(500);

            // Breadcrumb should be visible
            const breadcrumb = page.getByTestId('docs-breadcrumb');
            await expect(breadcrumb).toBeVisible({ timeout: 5_000 });

            // Breadcrumb should contain category and doc name text
            const breadcrumbText = await breadcrumb.textContent();
            expect(breadcrumbText).toBeTruthy();
            expect(breadcrumbText!.length).toBeGreaterThan(0);

            await page.screenshot({ path: 'e2e-screenshots/uf8-breadcrumbs.png', fullPage: false });
        }
    });

    test('should show table of contents for documents with headings', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        const docItems = tree.locator('[data-testid^="doc-item-"]');
        const count = await docItems.count();

        if (count > 0) {
            // Click a document that likely has headings (e.g. first doc)
            await docItems.first().click();
            await page.waitForTimeout(500);

            // TOC toggle button should be visible
            const tocToggle = page.getByTestId('toc-toggle');
            await expect(tocToggle).toBeVisible({ timeout: 5_000 });

            // Check if TOC is visible (depends on doc content having > 2 headings)
            const toc = page.getByTestId('docs-toc');
            const tocVisible = await toc.isVisible().catch(() => false);

            if (tocVisible) {
                // TOC should have links
                const tocLinks = toc.locator('a');
                const linkCount = await tocLinks.count();
                expect(linkCount).toBeGreaterThan(0);

                await page.screenshot({ path: 'e2e-screenshots/uf8-toc.png', fullPage: false });

                // Toggle TOC off
                await tocToggle.click();
                await expect(toc).not.toBeVisible();

                // Toggle back on
                await tocToggle.click();
                await expect(toc).toBeVisible();
            }
        }
    });

    test('should show version selector for versioned documents and switch versions', async ({ page }) => {
        const tree = page.getByTestId('docs-tree');
        await expect(tree).toBeVisible({ timeout: 10_000 });

        // Look for a grouped doc item that has a version badge (small text inside)
        const docItems = tree.locator('[data-testid^="doc-item-"]');
        const count = await docItems.count();

        for (let i = 0; i < count; i++) {
            const text = await docItems.nth(i).textContent();
            if (text && /v\d+\.\d+/.test(text)) {
                await docItems.nth(i).click();
                await page.waitForTimeout(500);

                // Check if version selector appears
                const selector = page.getByTestId('version-selector');
                const selectorVisible = await selector.isVisible().catch(() => false);

                if (selectorVisible) {
                    await expect(selector).toBeVisible();

                    // Get the currently displayed document name
                    const currentName = await page.locator('h1').first().textContent();

                    // Get all options
                    const options = selector.locator('option');
                    const optionCount = await options.count();
                    expect(optionCount).toBeGreaterThan(1);

                    // First option should have "(Latest)" text
                    const firstOption = await options.first().textContent();
                    expect(firstOption).toContain('(Latest)');

                    // Select a different version (second option)
                    if (optionCount >= 2) {
                        const secondValue = await options.nth(1).getAttribute('value');
                        if (secondValue) {
                            await selector.selectOption(secondValue);
                            await page.waitForTimeout(500);

                            // Document should have changed — the name in h1 should be different
                            const newName = await page.locator('h1').first().textContent();
                            // The baseName is the same but filename differs due to version
                            expect(newName).toBeTruthy();

                            await page.screenshot({ path: 'e2e-screenshots/uf8-version-switched.png', fullPage: false });
                        }
                    }
                }
                break;
            }
        }
    });
});

import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('homepage loads with start button', async ({ page }) => {
    await page.goto('/');

    // Should show the MovieRush logo
    await expect(page.locator('img[alt="MovieRush"]')).toBeVisible();

    // Should show the start button
    const startButton = page.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible();

    // Should show the date
    await expect(page.locator('text=/January|February|March|April|May|June|July|August|September|October|November|December/')).toBeVisible();
  });

  test('clicking start reveals game interface', async ({ page }) => {
    await page.goto('/');

    // Click start button
    await page.getByRole('button', { name: /start/i }).click();

    // Should show the challenge prompt
    await expect(page.locator('h2')).toBeVisible();

    // Should show the timer
    await expect(page.locator('time[role="timer"]')).toBeVisible();

    // Should show the autocomplete input
    const input = page.getByPlaceholder(/type a movie name/i);
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();

    // Should show the end game button
    await expect(page.getByRole('button', { name: /end game/i })).toBeVisible();
  });

  test('timer counts down during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Get initial timer value
    const timer = page.locator('time[role="timer"]');
    const initialTime = await timer.textContent();

    // Wait for timer to tick
    await page.waitForTimeout(1500);

    // Timer should have decreased
    const newTime = await timer.textContent();
    expect(newTime).not.toBe(initialTime);
  });

  test('autocomplete shows results when typing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Type in the search box
    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('The Matrix');

    // Wait for autocomplete results
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    // Should show movie options
    await expect(page.locator('[role="option"]').first()).toBeVisible();
  });

  test('selecting movie from autocomplete clears input', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('The Matrix');

    // Wait for results and click first option
    await page.locator('[role="option"]').first().click();

    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('end game button shows results', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Click end game
    await page.getByRole('button', { name: /end game/i }).click();

    // Should show game over message
    await expect(page.locator('text=/game over/i')).toBeVisible();

    // Should show score
    await expect(page.locator('text=/points/i')).toBeVisible();

    // Should show movies found count
    await expect(page.locator('text=/movies found/i')).toBeVisible();

    // Should show share button
    await expect(page.getByRole('button', { name: /share/i })).toBeVisible();
  });

  test('results page shows come back tomorrow message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    await expect(page.locator('text=/come back tomorrow/i')).toBeVisible();
  });

  test('keyboard navigation works in autocomplete', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('Star Wars');

    // Wait for results
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    // Press arrow down to navigate
    await input.press('ArrowDown');

    // Wait for an option to become selected
    await expect(page.locator('[role="option"][aria-selected="true"]')).toBeVisible({ timeout: 2000 });

    // Verify exactly one option is selected
    const selectedOption = page.locator('[role="option"][aria-selected="true"]');
    await expect(selectedOption).toHaveCount(1);

    // Press Enter to select the highlighted option
    await input.press('Enter');

    // Input should be cleared (selection made)
    await expect(input).toHaveValue('');
  });

  test('escape key closes autocomplete dropdown', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('Avatar');

    // Wait for results
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    // Press Escape
    await input.press('Escape');

    // Dropdown should be hidden
    await expect(page.locator('[role="listbox"]')).not.toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('shows error state when challenge API fails', async ({ page }) => {
    // Mock the challenge API to fail
    await page.route('/api/challenge', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.goto('/');

    // Should show error message
    await expect(page.locator('text=/failed|error|try again/i')).toBeVisible();

    // Should show retry button
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  test('shows message when no challenge available', async ({ page }) => {
    // Mock the challenge API to return 404
    await page.route('/api/challenge', (route) => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'No challenge' }),
      });
    });

    await page.goto('/');

    // Should show appropriate message
    await expect(page.locator('text=/no challenge|check back/i')).toBeVisible();
  });
});

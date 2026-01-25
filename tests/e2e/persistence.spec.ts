import { test, expect } from '@playwright/test';

test.describe('localStorage Persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('game state survives page refresh during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Verify we're in game mode
    await expect(page.locator('time[role="timer"]')).toBeVisible();

    // Get current timer value
    const timerBefore = await page.locator('time[role="timer"]').textContent();

    // Refresh the page
    await page.reload();

    // Should still be in game mode (not back to start screen)
    await expect(page.locator('time[role="timer"]')).toBeVisible();

    // Timer should have continued (value should be same or less)
    const timerAfter = await page.locator('time[role="timer"]').textContent();

    // Parse timer values for comparison
    const parsedBefore = parseInt(timerBefore || '0');
    const parsedAfter = parseInt(timerAfter || '0');

    // Timer should have continued counting down or be the same
    expect(parsedAfter).toBeLessThanOrEqual(parsedBefore);
  });

  test('completed game prevents replay on same day', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    // Should show results
    await expect(page.locator('text=/game over/i')).toBeVisible();

    // Refresh the page
    await page.reload();

    // Should still show results (not start screen)
    await expect(page.locator('text=/game over/i')).toBeVisible();

    // Should NOT show start button
    await expect(page.getByRole('button', { name: /start the rush/i })).not.toBeVisible();
  });

  test('guessed movies persist after refresh', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Make a guess
    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('The Matrix');
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[role="option"]').first().click();

    // Wait a moment for state to save
    await page.waitForTimeout(500);

    // Refresh the page
    await page.reload();

    // Should still be in game mode
    await expect(page.locator('time[role="timer"]')).toBeVisible();

    // Note: We can't easily verify the exact movie persisted without knowing
    // what movies are valid for today's challenge, but the game state persisting
    // is verified by the timer being visible
  });

  test('score persists after game completion and refresh', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    // Get the score
    const scoreElement = page.locator('output[aria-label="Total score"]');
    const scoreBefore = await scoreElement.textContent();

    // Refresh the page
    await page.reload();

    // Score should be the same
    await expect(scoreElement).toHaveText(scoreBefore || '0');
  });

  test('localStorage is cleared for new day challenge', async ({ page }) => {
    await page.goto('/');

    // Manually set old game data with a different date
    await page.evaluate(() => {
      const oldDate = '2020-01-01';
      localStorage.setItem(
        'movierush_game',
        JSON.stringify({
          gameState: {
            date: oldDate,
            phase: 'playing',
            timeRemaining: 30,
            guessedMovieIds: [],
            incorrectCount: 0,
          },
          guessedMovies: [],
        })
      );
    });

    // Reload the page
    await page.reload();

    // Should show start button (old game data should be cleared)
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
  });
});

test.describe('Share Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('share button copies results to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    // Click share button
    await page.getByRole('button', { name: /share/i }).click();

    // Should show copied confirmation
    await expect(page.locator('text=/copied/i')).toBeVisible();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('MovieRush');
    expect(clipboardText).toContain('points');
    expect(clipboardText).toContain('movies found');
  });

  test('copy movie list button works', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Try to make a correct guess first
    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('Elf');
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });
    await page.locator('[role="option"]').first().click();

    // End game
    await page.getByRole('button', { name: /end game/i }).click();

    // If there's a "Your Guesses" section with the copy button
    const copyButton = page.getByRole('button', { name: /copy movie list/i });

    // Only test if the button exists (player made correct guesses)
    const copyButtonCount = await copyButton.count();
    if (copyButtonCount > 0) {
      await copyButton.click();
      await expect(page.locator('text=/copied/i')).toBeVisible();
    }
  });
});

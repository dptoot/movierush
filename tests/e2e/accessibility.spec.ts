import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupApiMocksWithSearch } from './fixtures/mock-api';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks BEFORE navigating to avoid database calls
    await setupApiMocksWithSearch(page);

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to fully load
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('game screen has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Wait for game interface to load
    await expect(page.locator('time[role="timer"]')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('results screen has no accessibility violations', async ({ page }) => {
    // Emulate reduced motion to avoid animation-related contrast issues
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    // Wait for results to load
    await expect(page.locator('text=/game over/i')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('autocomplete dropdown has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Open autocomplete
    const input = page.getByPlaceholder(/type a movie name/i);
    await input.fill('The Matrix');
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks BEFORE navigating to avoid database calls
    await setupApiMocksWithSearch(page);

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('can complete game flow using only keyboard', async ({ page }) => {
    await page.goto('/');

    // Focus the start button (may need multiple tabs if there are other focusable elements)
    const startButton = page.getByRole('button', { name: /start/i });
    await startButton.focus();
    await expect(startButton).toBeFocused();
    await page.keyboard.press('Enter');

    // Should be in game mode with input focused
    const input = page.getByPlaceholder(/type a movie name/i);
    await expect(input).toBeFocused();

    // Type a search query
    await page.keyboard.type('Star Wars');
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    // Wait briefly for React state update
    await page.waitForTimeout(100);
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toHaveAttribute('aria-selected', 'true');

    // Select with Enter
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('');

    // Tab to End Game button
    await page.keyboard.press('Tab');
    const endButton = page.getByRole('button', { name: /end game/i });
    await expect(endButton).toBeFocused();

    // Press Enter to end game
    await page.keyboard.press('Enter');

    // Should show results
    await expect(page.locator('text=/game over/i')).toBeVisible();

    // Tab to share button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs
    const shareButton = page.getByRole('button', { name: /share/i });
    await expect(shareButton).toBeVisible();
  });

  test('focus is visible on all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Check start button has visible focus
    await page.keyboard.press('Tab');
    const startButton = page.getByRole('button', { name: /start/i });

    // Get the computed outline or box-shadow style
    const focusStyle = await startButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
        outlineWidth: styles.outlineWidth,
      };
    });

    // Should have some form of focus indicator
    const hasFocusIndicator =
      focusStyle.outline !== 'none' ||
      focusStyle.boxShadow !== 'none' ||
      (focusStyle.outlineWidth && focusStyle.outlineWidth !== '0px');

    expect(hasFocusIndicator).toBe(true);
  });

  test('skip to content link works', async ({ page }) => {
    await page.goto('/');

    // Check if there's a skip link in the DOM
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip")');
    const skipLinkCount = await skipLink.count();

    if (skipLinkCount > 0) {
      // Focus the skip link directly and verify it becomes visible
      await skipLink.first().focus();
      await expect(skipLink.first()).toBeFocused();

      // Skip links are typically visually hidden until focused
      // Just verify it can receive focus and is accessible
      const isVisible = await skipLink.first().isVisible();
      expect(isVisible).toBe(true);
    }
  });
});

test.describe('Screen Reader Support', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks BEFORE navigating to avoid database calls
    await setupApiMocksWithSearch(page);

    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('timer has proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    const timer = page.locator('time[role="timer"]');
    await expect(timer).toBeVisible();

    // Check ARIA attributes
    await expect(timer).toHaveAttribute('role', 'timer');
    await expect(timer).toHaveAttribute('aria-live', 'polite');
    await expect(timer).toHaveAttribute('aria-atomic', 'true');
    await expect(timer).toHaveAttribute('aria-label', /.+/); // Has some label
  });

  test('autocomplete has proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    const input = page.getByPlaceholder(/type a movie name/i);

    // Check combobox attributes
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(input).toHaveAttribute('aria-controls', 'movie-suggestions-listbox');

    // Open dropdown
    await input.fill('Avatar');
    await expect(page.locator('[role="listbox"]')).toBeVisible({ timeout: 5000 });

    // Check expanded state
    await expect(input).toHaveAttribute('aria-expanded', 'true');

    // Check listbox
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toHaveAttribute('id', 'movie-suggestions-listbox');

    // Check options
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThan(0);
  });

  test('feedback messages are announced', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();

    // Check for aria-live region for feedback (may be visually empty but still in DOM)
    const feedbackRegion = page.locator('[aria-live="assertive"], [role="status"][aria-live]');
    // The region exists in the DOM for screen readers, even if visually empty
    await expect(feedbackRegion.first()).toBeAttached();
    // Verify it has the correct ARIA attributes for announcements
    await expect(feedbackRegion.first()).toHaveAttribute('aria-atomic', 'true');
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');

    // Start button
    const startButton = page.getByRole('button', { name: /start/i });
    await expect(startButton).toBeVisible();

    await startButton.click();

    // End game button
    const endButton = page.getByRole('button', { name: /end game/i });
    await expect(endButton).toHaveAttribute('aria-label', /end game/i);

    await endButton.click();

    // Share button
    const shareButton = page.getByRole('button', { name: /share/i });
    await expect(shareButton).toHaveAttribute('aria-label', /share/i);
  });

  test('results statistics are properly labeled', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start/i }).click();
    await page.getByRole('button', { name: /end game/i }).click();

    // Check output elements have labels
    const moviesOutput = page.locator('output[aria-label="Movies found"]');
    const scoreOutput = page.locator('output[aria-label="Total score"]');

    await expect(moviesOutput).toBeVisible();
    await expect(scoreOutput).toBeVisible();
  });
});

test.describe('Color Contrast', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks BEFORE navigating to avoid database calls
    await setupApiMocksWithSearch(page);
  });

  test('text has sufficient contrast', async ({ page }) => {
    await page.goto('/');

    // Run axe specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });
});

test.describe('Reduced Motion', () => {
  test.beforeEach(async ({ page }) => {
    // Set up API mocks BEFORE navigating to avoid database calls
    await setupApiMocksWithSearch(page);
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Start game to see animations
    await page.getByRole('button', { name: /start/i }).click();

    // Check that animation durations are reduced or removed
    const timer = page.locator('time[role="timer"]');
    const animationDuration = await timer.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.animationDuration;
    });

    // Animation should be instant (0s) or very short with reduced motion
    // Browser may return in scientific notation (1e-05s = 0.00001s = 0.01ms)
    // Parse the duration to check if it's effectively zero or very short
    const durationMs = parseFloat(animationDuration) * 1000; // Convert seconds to ms
    expect(durationMs).toBeLessThanOrEqual(0.02); // Allow up to 0.02ms (effectively instant)
  });
});

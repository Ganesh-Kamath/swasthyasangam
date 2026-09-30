import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Access Countdown Timer Verification', () => {
  test('Timer initializes with valid countdown and decreases as time elapses', async ({ page }) => {
    const monitor = attachErrorMonitor(page);

    await page.goto('/');
    await page.getByTestId('start-demo-btn').click();
    await page.getByTestId('create-temporary-access-btn').click();
    await page.getByTestId('generate-qr-access-btn').click();

    await expect(page.getByTestId('qr-access-card')).toBeVisible();

    // 1. Read initial timer display
    const timerElem = page.getByTestId('access-timer').getByTestId('timer-value-display');
    await expect(timerElem).toBeVisible();
    const initialText = (await timerElem.textContent())?.trim() || '';

    // Verify format mm:ss (e.g. 29:xx or 30:00)
    expect(initialText).toMatch(/^(29|30):\d{2}$/);

    const [initM, initS] = initialText.split(':').map((v) => parseInt(v, 10));
    const initialSecondsTotal = initM * 60 + initS;

    // 2. Wait 2.2 seconds
    await page.waitForTimeout(2200);

    // 3. Read later timer display
    const laterText = (await timerElem.textContent())?.trim() || '';
    expect(laterText).toMatch(/^(29|30):\d{2}$/);

    const [laterM, laterS] = laterText.split(':').map((v) => parseInt(v, 10));
    const laterSecondsTotal = laterM * 60 + laterS;

    // Assert that the remaining seconds decreased
    expect(laterSecondsTotal).toBeLessThan(initialSecondsTotal);

    monitor.verifyNoErrors();
  });
});

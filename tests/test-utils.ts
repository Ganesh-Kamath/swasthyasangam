import { Page, BrowserContext, expect } from '@playwright/test';

/**
 * Monitors console and page errors; throws if any severe error occurs
 */
export function attachErrorMonitor(page: Page, allowedWarnings: string[] = []): { errors: string[]; verifyNoErrors: () => void } {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(`PageError: ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known expected HTTP authorization status logs (403 Forbidden, 410 Gone) and favicon logs
      const defaultAllowed = [
        'status of 403',
        'status of 410',
        '403 (Forbidden)',
        '410 (Gone)',
        'favicon'
      ];
      const isAllowed = [...allowedWarnings, ...defaultAllowed].some((w) => text.includes(w));
      if (!isAllowed) {
        errors.push(`ConsoleError: ${text}`);
      }
    }
  });

  return {
    errors,
    verifyNoErrors: () => {
      expect(errors, `Expected 0 runtime console/page errors, but got:\n${errors.join('\n')}`).toHaveLength(0);
    }
  };
}

/**
 * Clears localStorage to restore pristine demo state
 */
export async function resetLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

const VIEWPORTS = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile', width: 390, height: 844 }
];

test.describe('Responsive Layout Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`Render Patient QR & Doctor Access on ${vp.name} (${vp.width}x${vp.height}) without horizontal overflow`, async ({ page }) => {
      const monitor = attachErrorMonitor(page);

      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1. Patient Records Screen
      await page.goto('/?view=patient');
      await expect(page.getByTestId('patient-records-view')).toBeVisible();

      // Check no horizontal overflow
      const scrollWidth1 = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth1 = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth1).toBeLessThanOrEqual(innerWidth1 + 5);

      // 2. Patient QR Access Screen
      await page.getByTestId('create-temporary-access-btn').click();
      await page.getByTestId('generate-qr-access-btn').click();
      await expect(page.getByTestId('qr-access-card')).toBeVisible();

      // Verify QR code frame is fully visible and fits viewport
      const qrBox = await page.getByTestId('qr-frame-box').boundingBox();
      expect(qrBox).not.toBeNull();
      expect(qrBox!.x).toBeGreaterThanOrEqual(0);
      expect(qrBox!.x + qrBox!.width).toBeLessThanOrEqual(vp.width + 10);

      // Verify action buttons visible
      await expect(page.getByTestId('simulate-doctor-scan-btn')).toBeVisible();

      // Check no horizontal overflow on QR screen
      const scrollWidth2 = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth2 = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth2).toBeLessThanOrEqual(innerWidth2 + 5);

      // 3. Doctor Access Screen
      await page.getByTestId('simulate-doctor-scan-btn').click();
      await expect(page.getByTestId('doctor-access-view')).toBeVisible({ timeout: 5000 });

      // Verify records readable and timer visible
      await expect(page.getByTestId('doctor-patient-context-card')).toBeVisible();
      await expect(page.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();

      // Check no horizontal overflow on Doctor screen
      const scrollWidth3 = await page.evaluate(() => document.documentElement.scrollWidth);
      const innerWidth3 = await page.evaluate(() => window.innerWidth);
      expect(scrollWidth3).toBeLessThanOrEqual(innerWidth3 + 5);

      monitor.verifyNoErrors();
    });
  }
});

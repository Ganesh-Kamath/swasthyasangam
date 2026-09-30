import { test, expect } from '@playwright/test';

test.describe('Real Internet Cross-Device Workflow (swasthyasangam.netlify.app)', () => {
  test('Complete Patient Laptop -> Real Internet Server Storage -> Phone Doctor Flow', async ({ browser }) => {
    // DEVICE A: Patient Laptop (Isolated Context 1)
    const laptopContext = await browser.newContext();
    const laptopPage = await laptopContext.newPage();

    // 1. Patient opens live site and navigates to record selection
    await laptopPage.goto('https://swasthyasangam.netlify.app/');
    await expect(laptopPage.getByTestId('landing-view')).toBeVisible({ timeout: 15000 });
    await laptopPage.getByTestId('start-demo-btn').click();
    await expect(laptopPage.getByTestId('patient-records-view')).toBeVisible();

    // 2. Patient selectively shares ONLY ECG and 2D Echocardiogram (Unselect Lipid)
    const lipidCard = laptopPage.getByTestId('record-card-rec-lipid-02');
    await lipidCard.click(); // Unselect lipid
    await expect(lipidCard).not.toHaveClass(/selected/);

    // 3. Patient proceeds to create access session
    await laptopPage.getByTestId('create-temporary-access-btn').click();
    await expect(laptopPage.getByTestId('create-access-view')).toBeVisible();
    await expect(laptopPage.getByTestId('doctor-name-display')).toHaveText('Dr. Ananya Shah');

    // 4. Patient generates QR code
    await laptopPage.getByTestId('generate-qr-access-btn').click();
    await expect(laptopPage.getByTestId('qr-access-card')).toBeVisible();

    // Verify QR session ID and displayed records count
    const sessionCodeElem = laptopPage.getByTestId('session-id-display');
    await expect(sessionCodeElem).toBeVisible();
    const sessionCode = (await sessionCodeElem.textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    await expect(laptopPage.getByTestId('qr-shared-count-badge')).toContainText('2 of 12 records shared');
    await expect(laptopPage.getByTestId('qr-security-note')).toContainText('Zero Health Data in QR');

    // DEVICE B: Doctor's Phone / Separate Device (Isolated Context 2, ZERO shared storage)
    const phoneContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone viewport simulation
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const phonePage = await phoneContext.newPage();

    // 5. Phone opens the public session URL directly: https://swasthyasangam.netlify.app/<SESSION_CODE>
    const accessUrl = `https://swasthyasangam.netlify.app/${sessionCode}`;
    await phonePage.goto(accessUrl);
    await expect(phonePage.getByTestId('doctor-access-view')).toBeVisible({ timeout: 15000 });

    // Verify Doctor View Metadata on Phone
    await expect(phonePage.getByTestId('doctor-patient-name')).toHaveText('Rahul Mehta');
    await expect(phonePage.getByTestId('doctor-physician-name')).toHaveText('Dr. Ananya Shah');
    await expect(phonePage.getByTestId('doctor-shared-records-count')).toContainText('2 of 12 reports');

    // 6. Verify Selective Records: ONLY ECG & Echo visible; Lipid & Prescription HIDDEN
    await expect(phonePage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();
    await expect(phonePage.getByTestId('doctor-record-card-rec-echo-03')).toBeVisible();
    await expect(phonePage.getByTestId('doctor-record-card-rec-lipid-02')).not.toBeVisible();
    await expect(phonePage.getByTestId('doctor-record-card-rec-presc-04')).not.toBeVisible();

    // 7. Test Phone Refresh: Direct URL must reload cleanly from Netlify without 404
    await phonePage.reload();
    await expect(phonePage.getByTestId('doctor-access-view')).toBeVisible();
    await expect(phonePage.getByTestId('doctor-record-card-rec-ecg-01')).toBeVisible();

    // 8. Patient on Laptop clicks "Revoke Access"
    await laptopPage.getByTestId('revoke-access-btn').click();
    await expect(laptopPage.getByTestId('revoke-modal')).toBeVisible();
    await laptopPage.getByTestId('confirm-revoke-btn').click();

    // Verify Laptop immediately shows Revoked Status
    await expect(laptopPage.locator('.status-title')).toHaveText('Access Revoked');

    // 9. Phone refreshes: Access must be immediately revoked by the server
    await phonePage.waitForTimeout(1000);
    await phonePage.reload();
    await expect(phonePage.getByTestId('status-title-revoked')).toHaveText('ACCESS REVOKED');
    await expect(phonePage.getByTestId('doctor-record-card-rec-ecg-01')).not.toBeVisible();

    // 10. Test Invalid Session route on phone
    await phonePage.goto('https://swasthyasangam.netlify.app/SS-DOES-NOT-EXIST');
    await expect(phonePage.getByTestId('access-not-found-card')).toBeVisible();

    await laptopContext.close();
    await phoneContext.close();
  });
});

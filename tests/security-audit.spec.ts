import { test, expect } from '@playwright/test';
import { attachErrorMonitor } from './test-utils';

test.describe('Security & Authorization Audit: Zero Access After Expiry', () => {
  test.setTimeout(60000);
  test('Direct API Endpoints Authorization: All protected endpoints return HTTP 410 Gone after expiry', async ({ request, page }) => {
    // 1. Create a session via UI
    await page.goto('/?view=patient');
    await page.getByTestId('create-temporary-access-btn').click();
    await page.getByTestId('generate-qr-access-btn').click();

    await expect(page.getByTestId('qr-access-card')).toBeVisible();
    const sessionCode = (await page.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    // 2. Set expiry to 15s via simulate expiry
    await page.getByTestId('simulate-expiry-btn').click();
    await page.getByTestId('expire-15s-btn').click();

    // 3. Verify while ACTIVE, endpoints return 200 OK and data
    const activeRes = await request.get(`/api/session/${sessionCode}`);
    expect(activeRes.status()).toBe(200);
    const activeData = await activeRes.json();
    expect(activeData.status).toBe('active');
    expect(activeData.selectedRecordIds.length).toBeGreaterThan(0);

    const activeRecordsRes = await request.get(`/api/session/${sessionCode}/records`);
    expect(activeRecordsRes.status()).toBe(200);
    const activeRecordsData = await activeRecordsRes.json();
    expect(activeRecordsData.records.length).toBeGreaterThan(0);

    const firstRecordId = activeData.selectedRecordIds[0];
    const activeReportRes = await request.get(`/api/session/${sessionCode}/report/${firstRecordId}`);
    expect(activeReportRes.status()).toBe(200);
    const activeReportData = await activeReportRes.json();
    expect(activeReportData.report.id).toBe(firstRecordId);

    const activeInsightsRes = await request.get(`/api/session/${sessionCode}/insights`);
    expect(activeInsightsRes.status()).toBe(200);
    const activeInsightsData = await activeInsightsRes.json();
    expect(activeInsightsData.insights.length).toBeGreaterThan(0);

    // Verify Cache-Control headers on active responses
    expect(activeRes.headers()['cache-control']).toContain('no-store');
    expect(activeRecordsRes.headers()['cache-control']).toContain('no-store');

    // 4. Wait for expiry (16 seconds)
    await page.waitForTimeout(16000);

    // 5. Test Direct API: GET /api/session/:code returns HTTP 410 Gone with ZERO records
    const expiredRes = await request.get(`/api/session/${sessionCode}`);
    expect(expiredRes.status()).toBe(410);
    const expiredData = await expiredRes.json();
    expect(expiredData.status).toBe('expired');
    expect(expiredData.records).toBeUndefined();
    expect(expiredData.selectedRecordIds || []).toHaveLength(0);

    // 6. Test Direct API: GET /api/session/:code/records returns HTTP 410 Gone with ZERO records
    const expiredRecordsRes = await request.get(`/api/session/${sessionCode}/records`);
    expect(expiredRecordsRes.status()).toBe(410);
    const expiredRecordsData = await expiredRecordsRes.json();
    expect(expiredRecordsData.status).toBe('expired');
    expect(expiredRecordsData.records || []).toHaveLength(0);

    // 7. Test Direct API: GET /api/session/:code/report/:id returns HTTP 410 Gone with ZERO content
    const expiredReportRes = await request.get(`/api/session/${sessionCode}/report/${firstRecordId}`);
    expect(expiredReportRes.status()).toBe(410);
    const expiredReportData = await expiredReportRes.json();
    expect(expiredReportData.status).toBe('expired');
    expect(expiredReportData.report).toBeUndefined();

    // 8. Test Direct API: GET /api/session/:code/insights returns HTTP 410 Gone with ZERO insights
    const expiredInsightsRes = await request.get(`/api/session/${sessionCode}/insights`);
    expect(expiredInsightsRes.status()).toBe(410);
    const expiredInsightsData = await expiredInsightsRes.json();
    expect(expiredInsightsData.status).toBe('expired');
    expect(expiredInsightsData.insights || []).toHaveLength(0);
  });

  test('Direct API Endpoints Revocation: Revoked session returns HTTP 403 Forbidden with ZERO records', async ({ request, page }) => {
    // 1. Create a session
    await page.goto('/?view=patient');
    await page.getByTestId('create-temporary-access-btn').click();
    await page.getByTestId('generate-qr-access-btn').click();

    const sessionCode = (await page.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    // 2. Revoke session via button
    await page.getByTestId('revoke-access-btn').click();
    await page.getByTestId('confirm-revoke-btn').click();
    await expect(page.getByTestId('status-title-revoked').or(page.locator('.status-title'))).toContainText('Access Revoked');

    // 3. Test Direct API requests to revoked session return HTTP 403 Forbidden
    const revokedRes = await request.get(`/api/session/${sessionCode}`);
    expect(revokedRes.status()).toBe(403);
    const revokedData = await revokedRes.json();
    expect(revokedData.status).toBe('revoked');

    const revokedRecordsRes = await request.get(`/api/session/${sessionCode}/records`);
    expect(revokedRecordsRes.status()).toBe(403);
    const revokedRecordsData = await revokedRecordsRes.json();
    expect(revokedRecordsData.status).toBe('revoked');
    expect(revokedRecordsData.records || []).toHaveLength(0);
  });

  test('Doctor UI Lockout: Zero records and ACCESS EXPIRED shown upon expiry in Doctor View', async ({ browser }) => {
    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();

    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    // 1. Create session and set 15s expiry
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();

    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    await patientPage.getByTestId('simulate-expiry-btn').click();
    await patientPage.getByTestId('expire-15s-btn').click();

    // 2. Open doctor view
    await doctorPage.goto(`/${sessionCode}`);
    await expect(doctorPage.getByTestId('doctor-access-view')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).toBeVisible();

    // 3. Wait for timer cutoff
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible({ timeout: 20000 });
    await expect(doctorPage.getByTestId('status-title-expired')).toContainText('ACCESS EXPIRED');
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).not.toBeVisible();

    // 4. Reload page - verify persistent 410 lockout
    await doctorPage.reload();
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).not.toBeVisible();

    await patientContext.close();
    await doctorContext.close();
  });

  test('Client-Side Tampering Immunity: LocalStorage manipulation cannot restore access to expired session', async ({ browser }) => {
    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();

    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    // Create session & expire it with 15s simulation
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();

    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();
    expect(sessionCode).toBeTruthy();

    await patientPage.getByTestId('simulate-expiry-btn').click();
    await patientPage.getByTestId('expire-15s-btn').click();

    // Wait until expired on server
    await patientPage.waitForTimeout(16000);

    // Open Doctor page
    await doctorPage.goto(`/${sessionCode}`);
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();

    // Malicious doctor tries to alter localStorage to status: 'active' and future expiresAt
    await doctorPage.evaluate((code) => {
      const fakeSession = {
        id: code,
        status: 'active',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        selectedRecordIds: ['rec-ecg-01', 'rec-lipid-02'],
        records: [
          {
            id: 'rec-ecg-01',
            title: 'Hacked ECG Report',
            category: 'Cardiology',
            date: '2026-09-20',
            doctor: 'Dr. Hacker',
            facility: 'Malicious Lab',
            summary: 'Stolen Data'
          }
        ]
      };
      localStorage.setItem(`swasthya_session_${code}`, JSON.stringify(fakeSession));
      localStorage.setItem('swasthya_active_session', JSON.stringify(fakeSession));
    }, sessionCode);

    // Reload the page - the server 410 response MUST override local storage tampering
    await doctorPage.reload();

    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).not.toBeVisible();
    await expect(doctorPage.getByText('Hacked ECG Report')).not.toBeVisible();

    await patientContext.close();
    await doctorContext.close();
  });

  test('Multi-Tab Synchronization: Inactive tabs lock out immediately upon regaining focus/visibility after expiry', async ({ browser }) => {
    const context = await browser.newContext();
    const patientPage = await context.newPage();
    const doctorTab1 = await context.newPage();
    const doctorTab2 = await context.newPage();

    // Create session & set 15s expiry
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();
    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();

    await patientPage.getByTestId('simulate-expiry-btn').click();
    await patientPage.getByTestId('expire-15s-btn').click();

    // Load both doctor tabs while active
    await doctorTab1.goto(`/${sessionCode}`);
    await expect(doctorTab1.getByTestId('doctor-shared-records-list')).toBeVisible();

    await doctorTab2.goto(`/${sessionCode}`);
    await expect(doctorTab2.getByTestId('doctor-shared-records-list')).toBeVisible();

    // Switch focus back to tab 1 and wait for expiry
    await doctorTab1.bringToFront();
    await expect(doctorTab1.getByTestId('access-expired-card')).toBeVisible({ timeout: 20000 });

    // Now bring tab 2 to front -> visibilitychange / focus triggers immediate revalidation
    await doctorTab2.bringToFront();
    await expect(doctorTab2.getByTestId('access-expired-card')).toBeVisible({ timeout: 3000 });
    await expect(doctorTab2.getByTestId('doctor-shared-records-list')).not.toBeVisible();

    await context.close();
  });

  test('Back Button Navigation: Back-Forward cache cannot reveal records after expiry', async ({ browser }) => {
    const patientContext = await browser.newContext();
    const doctorContext = await browser.newContext();

    const patientPage = await patientContext.newPage();
    const doctorPage = await doctorContext.newPage();

    // Create session
    await patientPage.goto('/?view=patient');
    await patientPage.getByTestId('create-temporary-access-btn').click();
    await patientPage.getByTestId('generate-qr-access-btn').click();
    const sessionCode = (await patientPage.getByTestId('session-id-display').textContent())?.trim();

    await patientPage.getByTestId('simulate-expiry-btn').click();
    await patientPage.getByTestId('expire-15s-btn').click();

    // Doctor visits session
    await doctorPage.goto(`/${sessionCode}`);
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).toBeVisible();

    // Doctor navigates away to home page
    await doctorPage.goto('/?view=patient');
    await expect(doctorPage.getByTestId('patient-title')).toBeVisible();

    // Wait until 15s session expires
    await doctorPage.waitForTimeout(16000);

    // Doctor presses browser back button
    await doctorPage.goBack();

    // Verify doctor view revalidates with server and immediately locks out
    await expect(doctorPage.getByTestId('access-expired-card')).toBeVisible();
    await expect(doctorPage.getByTestId('doctor-shared-records-list')).not.toBeVisible();

    await patientContext.close();
    await doctorContext.close();
  });
});

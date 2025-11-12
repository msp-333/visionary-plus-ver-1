import { test, expect } from '@playwright/test'

test('Calibrate → Setup → Select Tumbling E → Run → Save → Export CSV', async ({ page }) => {
  await page.goto('/tests')

  // Calibration: use estimate if present; otherwise save card
  const continueBtn = page.getByRole('button', { name: /continue/i })
  const useEstimate = page.getByRole('button', { name: /use estimate/i })
  if (await useEstimate.isVisible()) await useEstimate.click()
  await continueBtn.click()

  // Setup: pick OD, set 40cm
  await page.getByRole('tab', { name: 'OD' }).click()
  await page.getByRole('button', { name: /40 cm/i }).click()
  await page.getByRole('button', { name: /continue/i }).click()

  // Select: choose Tumbling E near
  await page.getByRole('button', { name: /near visual acuity/i }).click()

  // Run: do one tap and save via sticky action
  await page.getByRole('button', { name: /e right/i }).click()
  await page.getByRole('button', { name: /save result/i }).click()

  // Results: export CSV
  await page.getByRole('button', { name: /export csv/i }).click()
  // (Download assertion depends on your test setup)
  await expect(page.getByText(/saved results/i)).toBeVisible()
})

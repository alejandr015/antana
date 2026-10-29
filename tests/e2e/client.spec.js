import { test, expect } from '@playwright/test';

test.describe('Flujo E2E Cliente – Antana (CL-01..CL-24, NF-04, NF-05)', () => {
  test('Home y Menú cargan correctamente con barra rápida y contacto oficial 320 444 9987 (NF-05)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#navbar')).toBeVisible();
    await expect(page.locator('.hero-quick-bar')).toBeVisible();
    await expect(page.locator('footer')).toContainText('320 444 9987');

    // CL-24: Verificar que el footer no tenga enlaces rotos href="#"
    const brokenSocialLinks = await page.locator('footer .social-links a[href="#"]').count();
    expect(brokenSocialLinks).toBe(0);
  });

  test('Responsive 360px sin scroll horizontal (NF-04)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/menu');
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Búsqueda de productos en el menú (CL-02)', async ({ page }) => {
    await page.goto('/menu');
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('hamburguesa');
  });
});


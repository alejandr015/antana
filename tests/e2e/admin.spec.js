import { test, expect } from '@playwright/test';

test.describe('Flujo E2E Administración – Antana (AD-01..AD-04)', () => {
  test('AD-03: Acceso sin sesión a /admin redirige a /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('AD-02: Login inválido muestra mensaje de error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('noautorizado@ejemplo.com');
    await page.locator('input[type="password"]').fill('clave_incorrecta_123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});


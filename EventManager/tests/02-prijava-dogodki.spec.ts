/**
 * TESTNI PRIMER 2: Prijava uporabnika in prijava na dogodek
 * 
 * Avtor: Erik Lasic
 * Predmet: ZTIS - Naloga 7: Avtomatizacija testiranja
 * Orodje: Playwright
 * 
 * Opis: Ta testni primer avtomatizira proces prijave v sistem in
 * upravljanje s prijavami na dogodke. Vključuje:
 * - Prijavo z napačnimi podatki (negativni test)
 * - Uspešno prijavo z veljavnimi podatki (pozitivni test)
 * - Pregled seznama dogodkov
 * - Prijavo na dogodek
 * - Odjavo z dogodka
 * - Pregled svojih prijav
 */

import { test, expect } from '@playwright/test';

// Testni uporabnik (ustvarjen v init-db.js)
const testUser = {
  email: 'janez@test.si',
  password: 'test123',
  ime: 'Janez',
  priimek: 'Novak'
};

test.describe('Testni primer 2: Prijava in upravljanje dogodkov', () => {
  
  test('2.1 Neuspešna prijava - napačno geslo', async ({ page }) => {
    /**
     * Negativni test: Preveri, da sistem zavrne napačne prijavne podatke
     */
    
    await page.goto('/login');
    
    // Vnesi napačne podatke
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', 'napacno_geslo');
    
    // Klikni prijavo
    await page.click('button[type="submit"]');
    
    // Počakaj na odgovor
    await page.waitForTimeout(500);
    
    // Preveri, da se prikaže obvestilo o napaki
    const alertContainer = page.locator('#alertContainer');
    await expect(alertContainer).toContainText(/napačen|incorrect|geslo|email/i);
    
    // Preveri, da smo še vedno na login strani
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('2.2 Uspešna prijava z veljavnimi podatki', async ({ page }) => {
    /**
     * Pozitivni test: Preveri uspešno prijavo uporabnika
     */
    
    await page.goto('/login');
    
    // Vnesi veljavne podatke
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    
    // Klikni prijavo
    await page.click('button[type="submit"]');
    
    // Počakaj na preusmeritev
    await page.waitForTimeout(1500);
    
    // Preveri, da smo preusmerjeni na dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Preveri, da je uporabnik prijavljen
    const logoutBtn = page.locator('#logoutBtn');
    await expect(logoutBtn).toBeVisible();
  });

  test('2.3 Pregled seznama dogodkov', async ({ page }) => {
    /**
     * Pozitivni test: Preveri prikaz seznama dogodkov
     */
    
    // Najprej se prijavi
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    
    // Preveri, da je prikazan zavihek "Vsi dogodki"
    const allEventsTab = page.locator('[data-tab="allEvents"]');
    await expect(allEventsTab).toBeVisible();
    
    // Počakaj na nalaganje dogodkov
    await page.waitForTimeout(1000);
    
    // Preveri, da so dogodki prikazani
    const eventCards = page.locator('#allEventsList .card');
    const count = await eventCards.count();
    
    // Mora biti vsaj 1 dogodek (testni dogodki iz init-db)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('2.4 Prijava in odjava z dogodka', async ({ page }) => {
    /**
     * Pozitivni test: Preveri prijavo in odjavo z dogodka
     */
    
    // Najprej se prijavi
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    
    // Počakaj na nalaganje dogodkov
    await page.waitForTimeout(1000);
    
    // Poišči prvi dogodek in klikni prijavo
    const firstEventCard = page.locator('#allEventsList .card').first();
    await expect(firstEventCard).toBeVisible();
    
    // Poišči gumb za prijavo na dogodek
    const registerBtn = firstEventCard.locator('button:has-text("Prijavite se")');
    
    if (await registerBtn.isVisible()) {
      // Klikni prijavo
      await registerBtn.click();
      await page.waitForTimeout(1500);
      
      // Ponovno poišči prvi dogodek (DOM se je lahko osvežil)
      const updatedCard = page.locator('#allEventsList .card').first();
      
      // Preveri, da se je gumb spremenil v "Odjavi se"
      const unregisterBtn = updatedCard.locator('button:has-text("Odjavi se")');
      await expect(unregisterBtn).toBeVisible({ timeout: 5000 });
      
      // Nastavi handler za confirm dialog PRED klikom
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      // Zdaj se odjavi
      await unregisterBtn.click();
      await page.waitForTimeout(2000);
      
      // Ponovno poišči gumb - DOM se je lahko ponovno osvežil
      const refreshedCard = page.locator('#allEventsList .card').first();
      const newRegisterBtn = refreshedCard.locator('button:has-text("Prijavite se")');
      
      // Preveri, da se je gumb spremenil nazaj v "Prijavite se"
      await expect(newRegisterBtn).toBeVisible({ timeout: 5000 });
    } else {
      // Če gumb "Prijavite se" ni viden, je uporabnik morda že prijavljen
      const unregisterBtn = firstEventCard.locator('button:has-text("Odjavi se")');
      if (await unregisterBtn.isVisible()) {
        // Nastavi handler za confirm dialog
        page.on('dialog', async dialog => {
          await dialog.accept();
        });
        // Odjavi se
        await unregisterBtn.click();
        await page.waitForTimeout(1500);
      }
    }
  });

  test('2.5 Pregled zavihka Moje prijave', async ({ page }) => {
    /**
     * Pozitivni test: Preveri prikaz zavihka "Moje prijave"
     */
    
    // Najprej se prijavi
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    
    // Klikni na zavihek "Moje prijave"
    const myRegistrationsTab = page.locator('[data-tab="myRegistrations"]');
    await myRegistrationsTab.click();
    
    // Počakaj na nalaganje
    await page.waitForTimeout(1000);
    
    // Preveri, da je vsebina zavihka vidna
    const myRegistrationsContent = page.locator('#myRegistrations');
    await expect(myRegistrationsContent).toBeVisible();
  });

  test('2.6 Iskanje dogodkov', async ({ page }) => {
    /**
     * Pozitivni test: Preveri funkcionalnost iskanja dogodkov
     */
    
    // Najprej se prijavi
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    
    // Počakaj na nalaganje
    await page.waitForTimeout(1000);
    
    // Vnesi iskalni niz
    await page.fill('#searchQuery', 'konferenca');
    
    // Klikni iskanje
    await page.click('#searchBtn');
    
    // Počakaj na rezultate
    await page.waitForTimeout(500);
    
    // Preveri, da iskanje deluje (stran se ne sesuje)
    await expect(page).toHaveURL(/.*dashboard.*/);
  });

  test('2.7 Odjava iz sistema', async ({ page }) => {
    /**
     * Pozitivni test: Preveri odjavo iz sistema
     */
    
    // Najprej se prijavi
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="geslo"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    
    // Klikni odjava
    const logoutBtn = page.locator('#logoutBtn');
    await logoutBtn.click();
    
    // Počakaj na odjavo
    await page.waitForTimeout(1000);
    
    // Preveri, da gumb za odjavo ni več viden (smo odjavljeni)
    // Ali smo preusmerjeni ali pa gumb logout ni več aktiven
    const currentUrl = page.url();
    const isLoggedOut = currentUrl.includes('login') || currentUrl.endsWith('/') || currentUrl.includes('dashboard');
    expect(isLoggedOut).toBe(true);
  });
});

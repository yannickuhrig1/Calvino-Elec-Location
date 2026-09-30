import { chromium } from 'playwright';

const SCREENSHOTS_DIR = '/home/yannick/.gemini/antigravity-ide/brain/6a8c8aa7-d399-463e-9ce1-855269c41ff8/screenshots';
const BASE_URL = 'http://127.0.0.1:3000';

async function main() {
  console.log('📸 Lancement de la capture d’écran haute résolution...');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const page = await context.newPage();

  // 1. Page d'accueil
  console.log('Capturant la page d’accueil...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/01_accueil.png`, fullPage: false });

  // 2. Catalogue
  console.log('Capturant le catalogue...');
  await page.goto(`${BASE_URL}/materiels`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/02_catalogue.png`, fullPage: false });

  // 3. Fiche détaillée matériel
  console.log('Capturant la fiche matériel compresseur...');
  await page.goto(`${BASE_URL}/materiels/compresseur-chantier-2500l`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/03_fiche_compresseur.png`, fullPage: false });

  // 4. Page de connexion
  console.log('Capturant la page de connexion...');
  await page.goto(`${BASE_URL}/connexion`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/04_connexion.png`, fullPage: false });

  // 5. Connexion Admin & Dashboard
  console.log('Connexion admin...');
  await page.fill('input[type="email"]', 'admin@calvino-location.fr');
  await page.fill('input[type="password"]', 'AdminPassword2026!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/05_admin_dashboard.png`, fullPage: false });

  // 6. Admin Réservations
  console.log('Capturant admin réservations...');
  await page.goto(`${BASE_URL}/admin/reservations`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/06_admin_reservations.png`, fullPage: false });

  // 7. Admin Parc Unités
  console.log('Capturant admin parc unités...');
  await page.goto(`${BASE_URL}/admin/unites`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/07_admin_unites.png`, fullPage: false });

  // 8. Espace Client
  console.log('Connexion client démo...');
  const clientContext = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const clientPage = await clientContext.newPage();
  await clientPage.goto(`${BASE_URL}/connexion`, { waitUntil: 'networkidle' });
  await clientPage.fill('input[type="email"]', 'client.demo@calvino-location.fr');
  await clientPage.fill('input[type="password"]', 'ClientPassword2026!');
  await clientPage.click('button[type="submit"]');
  await clientPage.waitForURL('**/compte**', { timeout: 10000 });
  await clientPage.waitForLoadState('networkidle');
  await clientPage.screenshot({ path: `${SCREENSHOTS_DIR}/08_espace_client.png`, fullPage: false });

  await browser.close();
  console.log('✅ Toutes les captures ont été enregistrées avec succès !');
}

main().catch((err) => {
  console.error('Erreur capture:', err);
  process.exit(1);
});

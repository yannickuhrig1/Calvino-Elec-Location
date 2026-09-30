import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/presentation ...');
  await page.goto('http://localhost:3000/presentation', { waitUntil: 'networkidle' });

  const screenshotsDir = '/home/yannick/Calvino Location/public/screenshots';

  // 1. Capture de la vue admin (onglet par défaut)
  await page.screenshot({
    path: path.join(screenshotsDir, '12_presentation_page_admin.png'),
    fullPage: false,
  });
  console.log('Saved 12_presentation_page_admin.png');

  // 2. Basculer sur l'onglet "Matériels & Expérience Client"
  await page.getByRole('button', { name: /Matériels & Expérience Client/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotsDir, '13_presentation_materiels.png'),
    fullPage: false,
  });
  console.log('Saved 13_presentation_materiels.png');

  // 3. Basculer sur l'onglet "Visite Visuelle HD (Zoom)"
  await page.getByRole('button', { name: /Visite Visuelle HD/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotsDir, '14_presentation_galerie.png'),
    fullPage: false,
  });
  console.log('Saved 14_presentation_galerie.png');

  // 4. Tester l'ouverture de la Lightbox au clic sur une vignette
  const firstThumbnail = page.locator('div[style*="cursor: pointer"]').first();
  await firstThumbnail.click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(screenshotsDir, '15_presentation_lightbox_zoom.png'),
    fullPage: false,
  });
  console.log('Saved 15_presentation_lightbox_zoom.png');

  // 5. Fermer la lightbox avec la touche Échap
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 6. Basculer sur "Simulateur & Accès Rapides"
  await page.getByRole('button', { name: /Simulateur & Accès Rapides/i }).click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(screenshotsDir, '16_presentation_simulateur.png'),
    fullPage: false,
  });
  console.log('Saved 16_presentation_simulateur.png');

  await browser.close();
  console.log('All presentation screenshots captured successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

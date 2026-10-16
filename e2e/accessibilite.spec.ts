import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createFamily, newAccount } from './helpers';

// Parcours 4 : accessibilité (règles WCAG 2.1 niveau AA, vérifiées par axe)
// Le contraste des couleurs du thème n'est pas vérifié ici : il dépend de la charte graphique
// (voir docs/accessibilite.md). Tout le reste doit être sans erreur.
const checkPage = async (page: Page, screen: string) => {
  await page.waitForTimeout(500); // fin des animations d'arrivée
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast'])
    .analyze();
  const problems = results.violations.map(v => `${screen} : ${v.id} (${v.nodes.length})`);
  expect(problems).toEqual([]);
};

test('les écrans principaux respectent les règles d\'accessibilité', async ({ page }) => {
  await page.goto('/connexion');
  await checkPage(page, 'connexion');
  await page.goto('/inscription');
  await checkPage(page, 'inscription');
  await page.goto('/cgu');
  await checkPage(page, 'CGU');

  // Compte prêt (onboarding et consentement compris), puis une Tribu
  await newAccount(page, 'Lina');
  await checkPage(page, 'accueil sans Tribu');
  await page.getByRole('link', { name: 'Chat' }).click();
  await checkPage(page, 'chat sans Tribu');
  await page.getByRole('link', { name: 'Accueil' }).click();
  await createFamily(page, `Accessibles ${Date.now()}`, 'Angers');
  await checkPage(page, 'accueil');

  await page.getByRole('link', { name: 'Activités' }).click();
  await checkPage(page, 'activités');
  await page.getByRole('button', { name: /Pique-nique au parc/ }).first().click();
  await checkPage(page, 'détail d\'une activité');
  await page.getByRole('button', { name: 'Retour' }).click();

  await page.getByRole('link', { name: 'Récompenses' }).click();
  await checkPage(page, 'récompenses');
  await page.getByRole('link', { name: 'Chat' }).click();
  await checkPage(page, 'chat');
  await page.getByRole('link', { name: 'Profil' }).click();
  await checkPage(page, 'profil');
});

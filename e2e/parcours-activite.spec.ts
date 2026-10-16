import { expect, test } from '@playwright/test';
import { createFamily, newAccount } from './helpers';

// Parcours 1 : de l'inscription à la première récompense
test('inscription, création de Tribu, activité terminée et récompense', async ({ page }) => {
  const familyName = `Champions ${Date.now()}`;

  // Inscription + onboarding + création de la Tribu
  await newAccount(page, 'Camille');
  await createFamily(page, familyName, 'Angers');
  await expect(page.getByText('Rien de prévu cette semaine')).toBeVisible();

  // Choix d'une activité dans le catalogue (ville de la Tribu)
  await page.getByRole('button', { name: 'Trouver une activité' }).click();
  await expect(page.getByRole('heading', { name: 'À faire à Angers' })).toBeVisible();
  await page.getByRole('button', { name: /Pique-nique au parc/ }).first().click();
  await expect(page.getByText('+ 50 points par membre')).toBeVisible();
  await page.getByRole('checkbox', { name: /Camille/ }).click();
  await page.getByRole('button', { name: 'Choisir cette activité' }).click();

  // L'accueil affiche l'activité en cours
  await expect(page.getByText('Pique-nique au parc à valider')).toBeVisible();
  await page.getByRole('button', { name: 'Valider' }).click();
  await page.getByRole('button', { name: 'Terminer cette activité' }).click();

  // Écran Récompense : points gagnés et premier badge
  await expect(page.getByRole('heading', { name: `Bravo, ${familyName} !` })).toBeVisible();
  await expect(page.getByText('+50')).toBeVisible();
  await expect(page.getByText('Premier pas')).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Retour à l'accueil : plus d'activité en cours, la Tribu a ses points
  await expect(page.getByText('Rien de prévu cette semaine')).toBeVisible();
  await expect(page.getByText('Encore 50 pts avant le niveau 2')).toBeVisible();
});

import { expect, test } from '@playwright/test';
import { newAccount, PASSWORD, signup } from './helpers';

// Parcours 3 : cas limites et sécurité
test('un écran protégé renvoie vers l\'inscription sans être connecté', async ({ page }) => {
  await page.goto('/chat');
  await expect(page).toHaveURL(/\/inscription$/);
});

test('un email déjà utilisé est refusé à l\'inscription', async ({ page, browser }) => {
  const email = await newAccount(page, 'Emma');
  const other = await (await browser.newContext()).newPage();
  await signup(other, 'Emma', email);
  await expect(other.getByText('Cet email est déjà utilisé.')).toBeVisible();
});

test('un mauvais mot de passe est refusé, le bon fonctionne', async ({ page, browser }) => {
  const email = await newAccount(page, 'Hugo');
  const other = await (await browser.newContext()).newPage();
  await other.goto('/connexion');
  await other.getByPlaceholder('Ex : camille@email.fr', { exact: true }).fill(email);
  await other.getByPlaceholder('**********', { exact: true }).fill('Mauvais1!motdepasse');
  await other.getByRole('button', { name: 'Se connecter' }).click();
  await expect(other.getByText('Email ou mot de passe incorrect.')).toBeVisible();

  await other.getByPlaceholder('**********', { exact: true }).fill(PASSWORD);
  await other.getByRole('button', { name: 'Se connecter' }).click();
  await expect(other.getByRole('heading', { name: 'Bonjour, Hugo' })).toBeVisible();
});

test('un lien direct vers une activité fonctionne (page rechargée)', async ({ page }) => {
  await newAccount(page, 'Lea');
  await page.getByRole('link', { name: 'Activités' }).click();
  await page.getByRole('button', { name: /Bowling/ }).first().click();
  await expect(page).toHaveURL(/\/activites\/[a-f0-9]+$/);
  await expect(page.getByRole('heading', { name: 'Bowling' })).toBeVisible();

  // Recharger la page = ouvrir le lien directement
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bowling' })).toBeVisible();
  await expect(page.getByText('+ 80 points par membre')).toBeVisible();
});

test('une session expirée renvoie vers la connexion', async ({ page }) => {
  await newAccount(page, 'Noah');
  // Token remplacé par un faux (comme un token expiré)
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('tribu:auth:user')!);
    saved.state.token = 'token-invalide';
    localStorage.setItem('tribu:auth:user', JSON.stringify(saved));
  });
  await page.reload();
  await expect(page).toHaveURL(/\/connexion$/);
});

test('une Tribu inconnue n\'est pas trouvée', async ({ page }) => {
  await newAccount(page, 'Jade');
  await page.getByRole('button', { name: /Rejoindre une Tribu/ }).click();
  await page.getByRole('searchbox').fill('Tribu qui n\'existe pas');
  await expect(page.getByText('Aucune Tribu trouvée :(')).toBeVisible();
});

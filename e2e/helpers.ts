import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'Motdepasse1!';

// Email différent à chaque lancement (la base garde les comptes tant que le backend tourne)
export const uniqueEmail = (name: string) => `${name.toLowerCase()}.${Date.now()}@test.fr`;

// Inscription avec la case CGU
export async function signup(page: Page, name: string, email: string) {
  await page.goto('/inscription');
  await page.getByPlaceholder('Ex : Camille', { exact: true }).fill(name);
  await page.getByPlaceholder('Ex : camille@email.fr', { exact: true }).fill(email);
  await page.getByPlaceholder('**********', { exact: true }).fill(PASSWORD);
  await page.getByRole('checkbox', { name: /J'accepte les conditions/ }).click();
  await page.getByRole('button', { name: "S'inscrire" }).click();
}

// Onboarding : date de naissance, couleur, avatar, puis l'accueil
export async function completeOnboarding(page: Page, name: string) {
  await page.getByPlaceholder('JJ', { exact: true }).fill('12');
  await page.getByPlaceholder('MM', { exact: true }).fill('05');
  await page.getByPlaceholder('AAAA', { exact: true }).fill('1990');
  await page.getByRole('button', { name: 'Suivant' }).click();

  await page.getByRole('button', { name: 'Thème orange' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();

  await page.getByRole('button', { name: 'Avatar 2' }).click();
  await page.getByRole('button', { name: 'Suivant' }).click();

  await expect(page.getByRole('heading', { name: `Bonjour, ${name}` })).toBeVisible();
}

// Nouveau compte prêt à utiliser l'app
export async function newAccount(page: Page, name: string) {
  const email = uniqueEmail(name);
  await signup(page, name, email);
  await completeOnboarding(page, name);
  return email;
}

// Création d'une Tribu depuis l'accueil
export async function createFamily(page: Page, familyName: string, city: string) {
  await page.getByRole('button', { name: /Créer une Tribu/ }).click();
  await page.getByPlaceholder('Ex : DreamTeam', { exact: true }).fill(familyName);
  await page.getByRole('button', { name: /Ville/ }).click();
  await page.getByRole('option', { name: city }).click();
  await page.getByRole('button', { name: 'Créer ma Tribu' }).click();
  await expect(page.getByText(familyName)).toBeVisible();
}

import { expect, test } from '@playwright/test';
import { createFamily, newAccount } from './helpers';

// Parcours 2 : deux téléphones en même temps (temps réel)
test('demande pour rejoindre, acceptation et message en direct', async ({ browser }) => {
  const familyName = `Explorateurs ${Date.now()}`;

  // Téléphone A : le créateur de la Tribu
  const parent = await (await browser.newContext()).newPage();
  await newAccount(parent, 'Sophie');
  await createFamily(parent, familyName, 'Nantes');

  // Téléphone B : un enfant cherche la Tribu et envoie une demande
  const child = await (await browser.newContext()).newPage();
  await newAccount(child, 'Lucas');
  await child.getByRole('button', { name: /Rejoindre une Tribu/ }).click();
  await child.getByRole('searchbox').fill(familyName);
  await child.getByRole('button', { name: new RegExp(familyName) }).click();
  await child.getByRole('button', { name: 'Envoyer une demande' }).click();
  await expect(child.getByText('Demande envoyée !')).toBeVisible();

  // A reçoit la demande en direct (cloche) et l'accepte
  await parent.getByRole('button', { name: 'Notifications, 1 non lue' }).click();
  const panel = parent.getByRole('dialog', { name: 'Notifications' });
  await expect(panel.getByText('Lucas souhaite rejoindre votre Tribu.')).toBeVisible();
  await panel.getByRole('button', { name: 'Accepter' }).click();
  await expect(panel.getByText('Demande acceptée')).toBeVisible();
  await parent.keyboard.press('Escape');

  // B arrive dans la Tribu sans recharger la page
  await child.getByRole('button', { name: 'Retour à l’accueil' }).click();
  await expect(child.getByText(familyName)).toBeVisible();

  // A envoie un message : point rouge sur l'onglet Chat de B, puis le message
  await parent.getByRole('link', { name: 'Chat' }).click();
  await parent.getByPlaceholder('Écris un message...', { exact: true }).fill('Bienvenue Lucas !');
  await parent.getByRole('button', { name: 'Envoyer' }).click();

  await expect(child.getByLabel('Messages non lus')).toBeVisible();
  await child.getByRole('link', { name: 'Chat' }).click();
  await expect(child.getByText('Bienvenue Lucas !')).toBeVisible();
  await expect(child.getByLabel('Messages non lus')).toHaveCount(0);
});

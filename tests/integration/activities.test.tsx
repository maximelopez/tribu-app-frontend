import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Activities from '../../src/screens/Activities';
import ActivityDetail from '../../src/screens/ActivityDetail';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi, renderScreen } from '../helpers';
import { bowling, catalog, family, familyActivity, picnic } from '../fixtures';

describe('Catalogue des activités', () => {
  const renderCatalog = () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
    mockApi({ 'GET activities': { body: catalog } });
    renderScreen(<Activities />);
  };

  it('montre les activités de la ville de la Tribu (et celles sans ville)', async () => {
    renderCatalog();
    expect(await screen.findByText('À faire à Angers')).toBeInTheDocument();
    expect(screen.getAllByText('Pique-nique').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jeux de société').length).toBeGreaterThan(0);
    expect(screen.queryByText('Bowling')).not.toBeInTheDocument();
  });

  it('change de ville et filtre par catégorie', async () => {
    renderCatalog();
    await screen.findByText('À faire à Angers');
    await userEvent.click(screen.getByRole('button', { name: /Angers/ }));
    await userEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: 'Nantes' }));
    expect(screen.getByText('À faire à Nantes')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Sport' }));
    expect(screen.getAllByText('Bowling').length).toBeGreaterThan(0);
    expect(screen.queryByText('Jeux de société')).not.toBeInTheDocument();
  });

  it('cherche une activité par son nom ou sa description', async () => {
    renderCatalog();
    await screen.findByText('À faire à Angers');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Rechercher une activité' }), 'parc');
    expect(screen.getAllByText('Pique-nique').length).toBeGreaterThan(0);
    expect(screen.queryByText('Jeux de société')).not.toBeInTheDocument();
  });

  it('prévient quand rien ne correspond', async () => {
    renderCatalog();
    await screen.findByText('À faire à Angers');
    await userEvent.type(screen.getByRole('searchbox', { name: 'Rechercher une activité' }), 'zzz');
    expect(screen.getByText('Aucune activité trouvée :(')).toBeInTheDocument();
  });

  it('affiche toute une section avec « Tout voir », puis revient', async () => {
    renderCatalog();
    await screen.findByText('À faire à Angers');
    await userEvent.click(screen.getAllByRole('button', { name: 'Tout voir' })[0]);
    expect(screen.queryByText('Les nouveautés')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retour aux activités' }));
    expect(screen.getByText('Les nouveautés')).toBeInTheDocument();
  });
});

describe('Détail d\'une activité', () => {
  const renderDetail = (id = 'a1') =>
    renderScreen(<ActivityDetail />, { path: '/activites/:activityId', url: `/activites/${id}` });
  const withFamily = () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setFamily(family);
  };

  it('présente l\'activité : catégorie, prix et points', async () => {
    withFamily();
    mockApi({ 'GET activities/a2': { body: bowling } });
    renderDetail('a2');
    expect(await screen.findByText('Bowling')).toBeInTheDocument();
    expect(screen.getByText('Sport')).toBeInTheDocument();
    expect(screen.getByText('1 partie offerte')).toBeInTheDocument();
    expect(screen.getByText('+ 80 points par membre')).toBeInTheDocument();
  });

  it('demande au moins un participant, puis lance l\'activité', async () => {
    withFamily();
    const calls = mockApi({
      'GET activities/a1': { body: picnic },
      'POST families/f1/activities': { status: 201, body: { familyActivity: familyActivity(picnic) } },
    });
    renderDetail();

    await userEvent.click(await screen.findByRole('button', { name: 'Choisir cette activité' }));
    expect(screen.getByText('Choisis au moins un participant.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: /Maxime/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Choisir cette activité' }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/));
    expect(calls.at(-1)).toEqual({ method: 'POST', path: 'families/f1/activities', body: { activityId: 'a1', participants: ['u1'] } });
    expect(useFamilyStore.getState().currentActivity?.id).toBe('fa-a1');
  });

  it('termine l\'activité en cours et ouvre l\'écran Récompense', async () => {
    withFamily();
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic));
    mockApi({
      'GET activities/a1': { body: picnic },
      'PATCH families/f1/activities/fa-a1/complete': {
        body: { familyPointsEarned: 100, familyPoints: 720, levelInfo: { level: 4, isMax: false, remaining: 280, progress: 0.72 }, newBadges: [] },
      },
    });
    renderDetail();

    expect(await screen.findByText('Ils participent')).toBeInTheDocument();
    expect(screen.getByText('2 membres sur 2 participent à cette activité.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: "Terminer l'activité" }));
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent(/^\/recompense$/));
    expect(useFamilyStore.getState().currentActivity).toBeNull();
    expect(useFamilyStore.getState().family?.points).toBe(720);
  });

  it('abandonne l\'activité après confirmation', async () => {
    withFamily();
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic));
    const calls = mockApi({ 'GET activities/a1': { body: picnic }, 'PATCH families/f1/activities/fa-a1/cancel': { body: {} } });
    renderDetail();

    await userEvent.click(await screen.findByRole('button', { name: "Abandonner l'activité" }));
    const dialog = screen.getByRole('dialog', { name: 'Abandonner cette activité ?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Oui, abandonner' }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/));
    expect(calls.some(c => c.path === 'families/f1/activities/fa-a1/cancel')).toBe(true);
    expect(useFamilyStore.getState().currentActivity).toBeNull();
  });

  it('seul celui qui l\'a lancée peut la terminer', async () => {
    withFamily();
    useFamilyStore.getState().setCurrentActivity(familyActivity(picnic, { startedBy: 'u5' }));
    mockApi({ 'GET activities/a1': { body: picnic } });
    renderDetail();
    expect(await screen.findByText(/lancée par Thomas/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Terminer l'activité" })).not.toBeInTheDocument();
  });

  it('indique une activité déjà réalisée par la Tribu', async () => {
    withFamily();
    useFamilyStore.getState().setCompletedActivities([
      familyActivity(picnic, { status: 'completed', completedAt: '2026-10-12T10:00:00.000Z', pointsPerMember: 50 }),
    ]);
    mockApi({ 'GET activities/a1': { body: picnic } });
    renderDetail();
    expect(await screen.findByText('Activité réalisée le 12 octobre')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Choisir cette activité' })).not.toBeInTheDocument();
  });

  it('invite à rejoindre une Tribu quand on n\'en a pas', async () => {
    loginAs();
    mockApi({ 'GET activities/a1': { body: picnic } });
    renderDetail();
    await userEvent.click(await screen.findByRole('button', { name: 'Rejoindre une Tribu' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/tribu/rechercher');
  });

  it('revient au catalogue si l\'activité n\'existe pas', async () => {
    withFamily();
    mockApi({ 'GET activities/inconnue': { status: 404 } });
    renderDetail('inconnue');
    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent(/^\/activites$/));
  });
});

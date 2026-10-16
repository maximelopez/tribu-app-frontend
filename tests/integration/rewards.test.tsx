import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Rewards from '../../src/screens/Rewards';
import AllBadges from '../../src/screens/AllBadges';
import BadgeDetail from '../../src/screens/BadgeDetail';
import ActivityReward from '../../src/screens/ActivityReward';
import ActivityHistory from '../../src/screens/ActivityHistory';
import { useFamilyStore } from '../../src/store/familyStore';
import { loginAs, mockApi, renderScreen } from '../helpers';
import { badge, bowling, familyActivity, picnic } from '../fixtures';

describe('Récompenses', () => {
  it('invite à rejoindre une Tribu quand on n\'en a pas', () => {
    loginAs();
    mockApi({});
    renderScreen(<Rewards />);
    expect(screen.getByText('Rejoins ou crée ta Tribu pour gagner tes premiers points et badges !')).toBeInTheDocument();
  });

  it('affiche la collection, les 3 derniers badges et le prochain objectif', async () => {
    loginAs({ familyId: 'f1' });
    const badges = [
      badge('premier-pas', 'Premier pas', { unlocked: true, unlockedAt: '2026-09-01T10:00:00.000Z' }),
      badge('nature', 'Nature', { unlocked: true, unlockedAt: '2026-10-12T10:00:00.000Z' }),
      badge('sport', 'Sport', { unlocked: true, unlockedAt: '2026-10-05T10:00:00.000Z' }),
      badge('maison', 'Maison', { unlocked: true, unlockedAt: '2026-10-01T10:00:00.000Z' }),
      badge('bavards', 'Bavards', { progress: 2, goal: 10 }),
      badge('marathon', 'Marathon', { progress: 8, goal: 10 }),
    ];
    mockApi({ 'GET families/f1/badges': { body: { badges, unlockedCount: 4, total: 24, lastUnlocked: badges[1] } } });
    renderScreen(<Rewards />);

    expect(await screen.findByText('4 / 24 débloqués')).toBeInTheDocument();
    // Les 3 plus récents, le plus récent en premier
    const names = ['Nature', 'Sport', 'Maison'].map(name => screen.getByText(name));
    expect(names[0].compareDocumentPosition(names[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText('Premier pas')).not.toBeInTheDocument();
    // Prochain objectif : le plus avancé (8 / 10)
    expect(screen.getByText('Prochain objectif')).toBeInTheDocument();
    expect(screen.getByText('Marathon')).toBeInTheDocument();
    expect(screen.queryByText('Bavards')).not.toBeInTheDocument();
  });

  it('ouvre le détail d\'un badge et la liste complète', async () => {
    loginAs({ familyId: 'f1' });
    const badges = [badge('nature', 'Nature', { unlocked: true, unlockedAt: '2026-10-12T10:00:00.000Z' })];
    mockApi({ 'GET families/f1/badges': { body: { badges, unlockedCount: 1, total: 24, lastUnlocked: badges[0] } } });
    renderScreen(<Rewards />, { path: '/recompenses' });

    await userEvent.click(await screen.findByRole('button', { name: /Nature/ }));
    expect(screen.getByTestId('path')).toHaveTextContent('/recompenses/badges/nature');
  });
});

describe('Tous les badges et détail d\'un badge', () => {
  const badges = [
    badge('premier-pas', 'Premier pas', {
      unlocked: true, unlockedAt: '2026-10-12T10:00:00.000Z', details: 'Terminer une première activité en famille.',
      nextBadge: { id: 'en-route', name: 'En route', goalText: '5 activités' },
    }),
    badge('en-route', 'En route', { progress: 1, goal: 5, remainingText: 'Encore 4 activités pour l\'obtenir !' }),
    badge('legende', 'Légende', { tier: 'platine' }),
  ];
  const routes = { 'GET families/f1/badges': { body: { badges, unlockedCount: 1, total: 3, lastUnlocked: badges[0] } } };

  it('classe les badges par niveau avec le nombre obtenu', async () => {
    loginAs({ familyId: 'f1' });
    mockApi(routes);
    renderScreen(<AllBadges />);
    expect(await screen.findByText('Premier pas')).toBeInTheDocument();
    expect(screen.getByText('Légende')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument(); // bronze : 1 obtenu sur 2
  });

  it('montre la date et le palier suivant d\'un badge obtenu', async () => {
    loginAs({ familyId: 'f1' });
    mockApi(routes);
    renderScreen(<BadgeDetail />, { path: '/recompenses/badges/:badgeId', url: '/recompenses/badges/premier-pas' });
    expect(await screen.findByText('Obtenu le 12 oct.')).toBeInTheDocument();
    expect(screen.getByText('Terminer une première activité en famille.')).toBeInTheDocument();
    expect(screen.getByText(/Prochain palier : En route/)).toBeInTheDocument();
  });

  it('montre ce qu\'il reste à faire pour un badge pas encore obtenu', async () => {
    loginAs({ familyId: 'f1' });
    mockApi(routes);
    renderScreen(<BadgeDetail />, { path: '/recompenses/badges/:badgeId', url: '/recompenses/badges/en-route' });
    expect(await screen.findByText('Encore 4 activités pour l\'obtenir !')).toBeInTheDocument();
    expect(screen.queryByText(/Obtenu le/)).not.toBeInTheDocument();
  });
});

describe('Écran Récompense', () => {
  const reward = {
    familyName: 'Champions', pointsEarned: 100, familyPoints: 1020, previousLevel: 4,
    levelInfo: { level: 5, isMax: false, remaining: 480, progress: 0.1 },
    newBadges: [badge('premier-pas', 'Premier pas', { unlocked: true, unlockedAt: '2026-10-14T10:00:00.000Z' })],
    activity: { imageUrl: null, category: 'nature' as const },
  };

  it('félicite la Tribu avec les points, le nouveau niveau et les badges', async () => {
    renderScreen(<ActivityReward />, { path: '/recompense', state: reward });
    expect(screen.getByText('Bravo, Champions !')).toBeInTheDocument();
    expect(screen.getByText('Vous êtes Niveau 5 !')).toBeInTheDocument();
    expect(screen.getByText('Nouveau badge débloqué')).toBeInTheDocument();
    expect(screen.getByText('Premier pas')).toBeInTheDocument();
    expect(screen.getByText('Nature')).toBeInTheDocument();
    expect(screen.getByText('Terminée')).toBeInTheDocument();
    expect(screen.getByText('Niveau supérieur')).toBeInTheDocument();
    expect(await screen.findByText('+100 points', {}, { timeout: 2000 })).toBeInTheDocument(); // les points défilent
    await userEvent.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it('revient à l\'accueil si on l\'ouvre sans données (page rechargée)', () => {
    renderScreen(<ActivityReward />, { path: '/recompense' });
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });
});

describe('Historique des activités', () => {
  it('liste les activités de la Tribu, ou seulement les siennes', async () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setCompletedActivities([
      familyActivity(picnic, { status: 'completed', completedAt: '2026-10-12T10:00:00.000Z' }),
      familyActivity(bowling, { status: 'completed', completedAt: '2026-10-05T10:00:00.000Z', participants: [{ id: 'u5', name: 'Thomas', avatar: 1 }] }),
    ]);
    renderScreen(<ActivityHistory />, { path: '/historique', url: '/historique' });
    expect(screen.getByText('Activités de la Tribu')).toBeInTheDocument();
    expect(screen.getByText('Pique-nique')).toBeInTheDocument();
    expect(screen.getByText('Bowling')).toBeInTheDocument();
  });

  it('ne garde que ses activités avec ?mode=me', () => {
    loginAs({ familyId: 'f1' });
    useFamilyStore.getState().setCompletedActivities([
      familyActivity(picnic, { status: 'completed' }),
      familyActivity(bowling, { status: 'completed', participants: [{ id: 'u5', name: 'Thomas', avatar: 1 }] }),
    ]);
    renderScreen(<ActivityHistory />, { path: '/historique', url: '/historique?mode=me' });
    expect(screen.getByText('Mes activités')).toBeInTheDocument();
    expect(screen.getByText('Pique-nique')).toBeInTheDocument();
    expect(screen.queryByText('Bowling')).not.toBeInTheDocument();
  });

  it('prévient quand aucune activité n\'est terminée', () => {
    loginAs({ familyId: 'f1' });
    renderScreen(<ActivityHistory />, { path: '/historique' });
    expect(screen.getByText('Aucune activité terminée pour l\'instant')).toBeInTheDocument();
  });
});

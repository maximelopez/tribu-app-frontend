import type { Activity, AppNotification, Family, FamilyActivity } from '../src/store/familyStore';
import type { Badge } from '../src/hooks/useFamilyBadges';

// Données de test communes : une Tribu, son catalogue, ses activités et ses badges

export const family: Family = {
  id: 'f1', name: 'Champions', city: 'Angers', points: 620,
  levelInfo: { level: 4, isMax: false, remaining: 380, progress: 0.62 },
  creatorId: 'u1', joinRequests: [],
  members: [
    { id: 'u1', name: 'Maxime', avatar: 2, points: 120 },
    { id: 'u5', name: 'Thomas', avatar: 1, points: 300 },
  ],
};

export const picnic: Activity = {
  _id: 'a1', name: 'Pique-nique', description: 'Un repas au parc', category: 'nature',
  isPartner: false, points: 50, city: 'Angers', createdAt: '2026-10-01',
};
export const bowling: Activity = {
  _id: 'a2', name: 'Bowling', description: 'Une partie en famille', category: 'sport',
  isPartner: true, offer: '1 partie offerte', points: 80, city: 'Nantes', createdAt: '2026-10-05',
};
export const boardGames: Activity = {
  _id: 'a3', name: 'Jeux de société', description: 'Une soirée à la maison', category: 'maison',
  isPartner: false, points: 30, city: null, createdAt: '2026-09-01',
};
export const catalog = [picnic, bowling, boardGames];

// Activité lancée par la Tribu (en cours par défaut)
export const familyActivity = (activity: Activity, changes: Partial<FamilyActivity> = {}): FamilyActivity => ({
  id: `fa-${activity._id}`, familyId: 'f1',
  activity: { id: activity._id, name: activity.name, description: activity.description, category: activity.category,
    isPartner: activity.isPartner, offer: activity.offer, points: activity.points ?? 0 },
  startedBy: 'u1',
  participants: [{ id: 'u1', name: 'Maxime', avatar: 2 }, { id: 'u5', name: 'Thomas', avatar: 1 }],
  status: 'ongoing', pointsPerMember: null, completedAt: null, createdAt: '2026-10-10',
  ...changes,
});

export const badge = (id: string, name: string, changes: Partial<Badge> = {}): Badge => ({
  id, tier: 'bronze', category: null, name, description: `Description de ${name}`, details: '',
  goal: 10, progress: 0, unlocked: false, unlockedAt: null, remainingText: null, nextBadge: null,
  ...changes,
});

export const joinRequestNotification: AppNotification = {
  id: 'n1', type: 'join_request', read: false, createdAt: '2026-10-14',
  data: { familyId: 'f1', familyName: 'Champions', userId: 'u7', userName: 'Lucas', status: 'pending' },
};

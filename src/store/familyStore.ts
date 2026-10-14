import { create } from 'zustand';

export interface Member {
  id: string;
  name: string;
  avatar: number;
  points: number;
}

export interface LevelInfo {
  level: number;
  isMax: boolean;
  remaining: number;
  progress: number; // de 0 à 1
}

export interface Family {
  id: string;
  name: string;
  city: string;
  points: number;
  levelInfo: LevelInfo;
  creatorId: string;
  joinRequests: { id: string; name: string }[];
  members?: Member[];
}

export type Category = 'nature' | 'culture' | 'sport' | 'maison';

// Activité du catalogue
export interface Activity {
  _id: string;
  name: string;
  description: string;
  category: Category;
  imageUrl?: string | null; // photo de l'activité (sinon : illustration de la catégorie)
  isPartner: boolean; // true = offre partenaire, false = activité libre
  offer?: string | null; // offre partenaire (ex : "1 partie offerte"), seulement si isPartner
  points?: number;    // points gagnés par chaque membre inscrit
}

// Activité lancée par la Tribu (backend : FamilyActivity)
export interface FamilyActivity {
  id: string;
  familyId: string;
  activity: {
    id: string;
    name: string;
    description: string;
    category: Category;
    imageUrl?: string | null;
    isPartner: boolean;
    offer?: string | null;
    points: number;
  };
  startedBy: string;
  participants: { id: string; name: string; avatar: number | null }[];
  status: 'ongoing' | 'completed' | 'cancelled';
  pointsPerMember: number | null;
  completedAt: string | null;
  createdAt: string;
}

// Convertit l'activité d'une FamilyActivity au format du catalogue (pour l'écran détail)
export const toCatalogActivity = (familyActivity: FamilyActivity): Activity => {
  const { id, ...activity } = familyActivity.activity;
  return { _id: id, ...activity };
};

// Demande en attente pour rejoindre une Tribu (une seule à la fois)
export interface PendingRequest {
  familyId: string;
  name: string;
  city: string;
}

// Notification de la cloche (backend : GET /notifications)
export type NotificationType =
  | 'join_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'member_joined'
  | 'activity_started'
  | 'activity_completed'
  | 'badge_unlocked';

export interface AppNotification {
  id: string;
  type: NotificationType;
  data: {
    familyId?: string | null;
    familyName?: string | null;
    userId?: string | null;
    userName?: string | null;
    activityId?: string | null;
    activityName?: string | null;
    points?: number | null;
    badgeId?: string | null;
    badgeName?: string | null;
    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | null; // demande pour rejoindre
  };
  read: boolean;
  createdAt: string;
}

interface FamilyStore {
  family: Family | null;
  setFamily: (family: Family | null | ((prev: Family | null) => Family | null)) => void;
  clearFamily: () => void;
  // Chargement initial de la Tribu (spinner du Home)
  isLoadingFamily: boolean;
  setIsLoadingFamily: (val: boolean) => void;
  // Activité en cours de la Tribu (une seule à la fois)
  currentActivity: FamilyActivity | null;
  setCurrentActivity: (activity: FamilyActivity | null) => void;
  // Historique des activités terminées (les plus récentes d'abord)
  completedActivities: FamilyActivity[];
  setCompletedActivities: (list: FamilyActivity[] | ((prev: FamilyActivity[]) => FamilyActivity[])) => void;
  // Messages non lus du chat (point rouge sur l'onglet Chat)
  unreadCount: number;
  setUnreadCount: (count: number | ((prev: number) => number)) => void;
  // Demande envoyée pour rejoindre une Tribu, en attente de réponse (Accueil sans Tribu)
  pendingRequest: PendingRequest | null;
  setPendingRequest: (request: PendingRequest | null) => void;
  // Notifications de la cloche (Accueil) et nombre de non lues
  notifications: AppNotification[];
  setNotifications: (list: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => void;
  unreadNotifications: number;
  setUnreadNotifications: (count: number | ((prev: number) => number)) => void;
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  setFamily: (familyOrUpdater) =>
    set((state) => ({
      family: typeof familyOrUpdater === 'function'
        ? familyOrUpdater(state.family)
        : familyOrUpdater,
    })),
  clearFamily: () => set({
    family: null,
    currentActivity: null,
    completedActivities: [],
    unreadCount: 0,
    pendingRequest: null,
    notifications: [],
    unreadNotifications: 0,
  }),
  isLoadingFamily: false,
  setIsLoadingFamily: (val) => set({ isLoadingFamily: val }),
  currentActivity: null,
  setCurrentActivity: (activity) => set({ currentActivity: activity }),
  completedActivities: [],
  setCompletedActivities: (listOrUpdater) =>
    set((state) => ({
      completedActivities: typeof listOrUpdater === 'function'
        ? listOrUpdater(state.completedActivities)
        : listOrUpdater,
    })),
  unreadCount: 0,
  setUnreadCount: (countOrUpdater) =>
    set((state) => ({
      unreadCount: typeof countOrUpdater === 'function' ? countOrUpdater(state.unreadCount) : countOrUpdater,
    })),
  pendingRequest: null,
  setPendingRequest: (request) => set({ pendingRequest: request }),
  notifications: [],
  setNotifications: (listOrUpdater) =>
    set((state) => ({
      notifications: typeof listOrUpdater === 'function' ? listOrUpdater(state.notifications) : listOrUpdater,
    })),
  unreadNotifications: 0,
  setUnreadNotifications: (countOrUpdater) =>
    set((state) => ({
      unreadNotifications:
        typeof countOrUpdater === 'function' ? countOrUpdater(state.unreadNotifications) : countOrUpdater,
    })),
}));

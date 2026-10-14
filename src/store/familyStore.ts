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
}

export const useFamilyStore = create<FamilyStore>((set) => ({
  family: null,
  setFamily: (familyOrUpdater) =>
    set((state) => ({
      family: typeof familyOrUpdater === 'function'
        ? familyOrUpdater(state.family)
        : familyOrUpdater,
    })),
  clearFamily: () => set({ family: null, currentActivity: null, completedActivities: [], unreadCount: 0, pendingRequest: null }),
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
}));

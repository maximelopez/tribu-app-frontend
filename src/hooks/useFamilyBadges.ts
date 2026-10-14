import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Category } from '../store/familyStore';
import { api } from '../api';

// Badge de la Tribu (backend : GET /families/:id/badges)
export interface Badge {
  id: string;
  category: Category;
  name: string;
  description: string; // texte court (cartes)
  details: string;     // texte long (détail du badge)
  goal: number;        // activités à terminer dans la catégorie
  progress: number;    // activités déjà terminées (max : goal)
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface FamilyBadges {
  badges: Badge[];
  unlockedCount: number;
  total: number;
  lastUnlocked: Badge | null;
}

// Badges de la Tribu de l'utilisateur, rechargés quand une activité est terminée
export default function useFamilyBadges() {
  const familyId = useUserStore(state => state.user?.familyId);
  const completedCount = useFamilyStore(state => state.completedActivities.length);

  const [data, setData] = useState<FamilyBadges | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchBadges = async () => {
      try {
        const res = await api(`families/${familyId}/badges`);
        if (res.ok && !cancelled) setData(await res.json());
      } catch (error) {
        console.error('Erreur badges:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBadges();
    return () => { cancelled = true; };
  }, [familyId, completedCount]);

  return { data, loading };
}

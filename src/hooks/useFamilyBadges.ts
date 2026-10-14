import { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Category } from '../store/familyStore';
import { api } from '../api';

// Niveau d'un badge, du plus courant au plus rare
export type BadgeTier = 'bronze' | 'argent' | 'or' | 'platine';
export const BADGE_TIERS: BadgeTier[] = ['bronze', 'argent', 'or', 'platine'];

// Badge de la Tribu (backend : GET /families/:id/badges)
export interface Badge {
  id: string;
  tier: BadgeTier;
  category: Category | null; // badges de catégorie seulement
  name: string;
  description: string; // texte court (cartes)
  details: string;     // texte long (détail du badge)
  goal: number;        // objectif à atteindre (activités, messages, niveau...)
  progress: number;    // progression actuelle (max : goal)
  unlocked: boolean;
  unlockedAt: string | null;
  remainingText: string | null; // ex : "Encore 5 activités Nature pour l'obtenir !" (null si obtenu)
  nextBadge: { id: string; name: string; goalText: string } | null; // palier suivant
}

export interface FamilyBadges {
  badges: Badge[];
  unlockedCount: number;
  total: number;
  lastUnlocked: Badge | null;
}

// Badges d'une Tribu : par défaut celle de l'utilisateur (rechargés quand une activité est terminée),
// ou une autre Tribu (ex : détails d'une Tribu avant de la rejoindre)
export default function useFamilyBadges(otherFamilyId?: string) {
  const myFamilyId = useUserStore(state => state.user?.familyId);
  const familyId = otherFamilyId ?? myFamilyId;
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

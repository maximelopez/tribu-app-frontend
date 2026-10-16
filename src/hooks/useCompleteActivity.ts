import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import { api } from '../api';

interface CompleteOptions {
  // Appelé juste avant l'appel au serveur (ex : figer l'affichage de l'activité)
  onStart?: () => void;
  // Appelé si l'activité n'a pas pu être terminée
  onFail?: () => void;
}

// Termine l'activité en cours (seulement celui qui l'a lancée) puis ouvre l'écran Récompense
export default function useCompleteActivity() {
  const navigate = useNavigate();
  const familyId = useUserStore(state => state.user?.familyId);
  const family = useFamilyStore(state => state.family);
  const setFamily = useFamilyStore(state => state.setFamily);
  const setCurrentActivity = useFamilyStore(state => state.setCurrentActivity);

  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState('');

  const completeActivity = async (ongoing: FamilyActivity, options: CompleteOptions = {}) => {
    if (!familyId || completing) return;

    setCompleting(true);
    setCompleteError('');
    options.onStart?.();

    try {
      const response = await api(`families/${familyId}/activities/${ongoing.id}/complete`, { method: 'PATCH' });
      const data = await response.json();

      if (!response.ok) {
        options.onFail?.();
        setCompleteError(data.message || 'Une erreur est survenue.');
        return;
      }

      // Écran Récompense (remplace l'écran actuel : pas de retour possible dessus)
      navigate('/recompense', {
        replace: true,
        state: {
          familyName: family?.name ?? 'la Tribu',
          pointsEarned: data.familyPointsEarned,
          familyPoints: data.familyPoints,
          previousLevel: family?.levelInfo?.level ?? data.levelInfo.level,
          levelInfo: data.levelInfo,
          newBadges: data.newBadges ?? [], // badges débloqués par cette activité
          activity: { imageUrl: ongoing.activity.imageUrl, category: ongoing.activity.category }, // photo et catégorie en haut
        },
      });

      // Points et niveau de la Tribu à jour tout de suite (le temps réel recharge le reste)
      setFamily(prev => (prev ? { ...prev, points: data.familyPoints, levelInfo: data.levelInfo } : prev));
      setCurrentActivity(null);
    } catch (error) {
      options.onFail?.();
      console.error("Erreur fin d'activité :", error);
      setCompleteError('Impossible de se connecter au serveur.');
    } finally {
      setCompleting(false);
    }
  };

  return { completeActivity, completing, completeError };
}

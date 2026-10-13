import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import { API_URL } from '../config';

// Charge la Tribu, ses membres, l'activité en cours et l'historique.
// Dans mobile c'est fait par le Home (toujours monté) ; ici c'est fait une seule fois
// pour toute l'app connectée, pour que chaque écran (Chat, Profil…) ait les données
// même si on l'ouvre directement par son adresse.
export default function useFamilyData() {
  const familyId = useUserStore(state => state.user?.familyId);
  const setFamily = useFamilyStore(state => state.setFamily);
  const setIsLoadingFamily = useFamilyStore(state => state.setIsLoadingFamily);
  const setCurrentActivity = useFamilyStore(state => state.setCurrentActivity);
  const setCompletedActivities = useFamilyStore(state => state.setCompletedActivities);

  // Tribu + membres (en parallèle)
  useEffect(() => {
    if (!familyId) {
      setFamily(null);
      return;
    }

    const fetchFamily = async () => {
      setIsLoadingFamily(true);
      try {
        const [responseFamily, responseMembers] = await Promise.all([
          fetch(`${API_URL}families/${familyId}`),
          fetch(`${API_URL}users?familyId=${familyId}`),
        ]);
        const [dataFamily, dataMembers] = await Promise.all([
          responseFamily.json(),
          responseMembers.json(),
        ]);

        if (!responseFamily.ok) return;

        setFamily({
          ...dataFamily.family,
          joinRequests: dataFamily.family.joinRequests.map((u: any) =>
            typeof u === 'string' ? { id: u, name: 'Utilisateur inconnu' } : u
          ),
          members: dataMembers.users,
        });
      } catch (error) {
        console.error('Erreur fetch famille :', error);
      } finally {
        setIsLoadingFamily(false);
      }
    };

    fetchFamily();
    // Seulement quand on change de Tribu : pas à chaque mise à jour de l'utilisateur (points…)
  }, [familyId, setFamily, setIsLoadingFamily]);

  // Activité en cours + historique des activités terminées
  useEffect(() => {
    if (!familyId) {
      setCurrentActivity(null);
      setCompletedActivities([]);
      return;
    }

    const fetchActivities = async () => {
      try {
        const [resCurrent, resHistory] = await Promise.all([
          fetch(`${API_URL}families/${familyId}/activities/current`),
          fetch(`${API_URL}families/${familyId}/activities`),
        ]);
        const [dataCurrent, dataHistory] = await Promise.all([resCurrent.json(), resHistory.json()]);

        if (resCurrent.ok) setCurrentActivity(dataCurrent.familyActivity);
        if (resHistory.ok) setCompletedActivities(dataHistory.familyActivities);
      } catch (error) {
        console.error('Erreur fetch activités de la Tribu :', error);
      }
    };

    fetchActivities();
  }, [familyId, setCurrentActivity, setCompletedActivities]);
}

import { useEffect, useState } from 'react';
import type { Activity } from '../store/familyStore';
import { api } from '../api';

// Catalogue gardé en mémoire : chargé une fois, partagé entre l'Accueil et l'onglet Activités
let cache: Activity[] | null = null;

// Catalogue d'activités (rechargé en arrière-plan à chaque ouverture d'un écran qui l'utilise)
export default function useCatalog() {
  const [activities, setActivities] = useState<Activity[]>(cache ?? []);
  const [isLoading, setIsLoading] = useState(cache === null);

  useEffect(() => {
    let cancelled = false;
    const fetchActivities = async () => {
      try {
        const response = await api('activities');
        const data = await response.json();
        if (response.ok && !cancelled) {
          cache = data;
          setActivities(data);
        }
      } catch (error) {
        console.error('Erreur chargement du catalogue :', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchActivities();
    return () => {
      cancelled = true;
    };
  }, []);

  return { activities, isLoading };
}

// Les activités les plus récentes d'abord
export const sortByNewest = (activities: Activity[]) =>
  [...activities].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

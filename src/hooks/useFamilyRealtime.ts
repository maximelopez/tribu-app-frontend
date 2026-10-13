import { useEffect } from 'react';
import { socket } from '../socket';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Family, FamilyActivity } from '../store/familyStore';
import { API_URL } from '../config';


export default function useFamilyRealtime() {
  const userId = useUserStore(state => state.user?.id);
  const familyId = useUserStore(state => state.user?.familyId);
  const setUser = useUserStore((state) => state.setUser);
  const setFamily = useFamilyStore((state) => state.setFamily);
  const setCurrentActivity = useFamilyStore((state) => state.setCurrentActivity);
  const setCompletedActivities = useFamilyStore((state) => state.setCompletedActivities);

  useEffect(() => {
    if (!userId) return;

    // Rejoindre les rooms
    socket.emit('registerUser', userId);
    if (familyId) socket.emit('joinFamilyRoom', familyId);

    // Handlers stables
    const handleNewJoinRequest = async (data: { familyId: string; userId: string }) => {
      try {
        // fetch les infos de l'utilisateur qui a demandé
        const res = await fetch(`${API_URL}users/${data.userId}`);
        const userData = await res.json();
        const userName = userData.name || 'Utilisateur inconnu';

        setFamily((prev) => {
          if (!prev) return prev;

          // On vérifie qu'on est bien le créateur
          if (prev.creatorId !== userId) return prev;

          const alreadyExists = prev.joinRequests.some(
            (req) => req.id === data.userId
          );

          if (alreadyExists) return prev;

          return {
            ...prev,
            joinRequests: [
              ...prev.joinRequests,
              { id: data.userId, name: userName },
            ],
          };
        });
      } catch (error) {
        console.error('Erreur fetch user pour joinRequest', error);
      }
    };

    // Fusionne les infos reçues avec la famille déjà en mémoire
    const handleFamilyUpdated = (data: Partial<Family>) => {
      setFamily((prev) => (prev ? { ...prev, ...data } : prev));
    };

    const handleFamilyAccepted = async (data: { familyId: string }) => {
      setUser((prevUser) =>
        prevUser ? { ...prevUser, familyId: data.familyId } : prevUser
      );

      try {
        const response = await fetch(`${API_URL}families/${data.familyId}`);
        const result = await response.json();
        if (result.family) setFamily(result.family);
      } catch (err) {
        console.error('Erreur fetch famille après acceptation :', err);
      }
    };

    // La personne a été acceptée ailleurs : on retire sa demande de notre liste
    const handleJoinRequestRemoved = (data: { familyId: string; userId: string }) => {
      setFamily((prev) => {
        if (!prev || prev.id !== data.familyId) return prev;
        return {
          ...prev,
          joinRequests: prev.joinRequests.filter((req) => req.id !== data.userId),
        };
      });
    };

    // Un nouveau membre a rejoint : on recharge la liste des membres
    const handleMemberJoined = async () => {
      if (!familyId) return;
      try {
        const res = await fetch(`${API_URL}users?familyId=${familyId}`);
        const data = await res.json();
        setFamily((prev) => (prev ? { ...prev, members: data.users } : prev));
      } catch (error) {
        console.error('Erreur fetch membres :', error);
      }
    };

    // Activité de la Tribu lancée, terminée ou annulée par un membre
    const handleFamilyActivityUpdated = async (data: FamilyActivity) => {
      if (data.status === 'ongoing') {
        setCurrentActivity(data);
        return;
      }

      // Terminée ou annulée : plus d'activité en cours
      const current = useFamilyStore.getState().currentActivity;
      if (current?.id === data.id) setCurrentActivity(null);

      // Terminée : ajout en tête de l'historique (sans doublon)
      if (data.status === 'completed') {
        setCompletedActivities((prev) => [data, ...prev.filter((a) => a.id !== data.id)]);
      }

      // Terminée : les points ont changé, on recharge la Tribu et les membres
      if (data.status === 'completed' && familyId) {
        try {
          const [resFamily, resMembers] = await Promise.all([
            fetch(`${API_URL}families/${familyId}`),
            fetch(`${API_URL}users?familyId=${familyId}`),
          ]);
          const dataFamily = await resFamily.json();
          const dataMembers = await resMembers.json();
          setFamily((prev) => prev ? {
            ...prev,
            points: dataFamily.family?.points ?? prev.points,
            levelInfo: dataFamily.family?.levelInfo ?? prev.levelInfo,
            members: dataMembers.users ?? prev.members,
          } : prev);

          // Les points de l'utilisateur connecté aussi
          const me = dataMembers.users?.find((m: any) => m.id === userId);
          if (me) setUser((prev) => (prev ? { ...prev, points: me.points } : prev));
        } catch (error) {
          console.error('Erreur mise à jour après activité terminée :', error);
        }
      }
    };

    // Écoute des events
    socket.on('newJoinRequest', handleNewJoinRequest);
    socket.on('familyUpdated', handleFamilyUpdated);
    socket.on('familyAccepted', handleFamilyAccepted);
    socket.on('joinRequestRemoved', handleJoinRequestRemoved);
    socket.on('memberJoined', handleMemberJoined);
    socket.on('familyActivityUpdated', handleFamilyActivityUpdated);

    // Nettoyage
    return () => {
      socket.off('newJoinRequest', handleNewJoinRequest);
      socket.off('familyUpdated', handleFamilyUpdated);
      socket.off('familyAccepted', handleFamilyAccepted);
      socket.off('joinRequestRemoved', handleJoinRequestRemoved);
      socket.off('memberJoined', handleMemberJoined);
      socket.off('familyActivityUpdated', handleFamilyActivityUpdated);
    };
  }, [userId, familyId]);
}
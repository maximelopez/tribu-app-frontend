import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { socket } from '../socket';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import type { Family, FamilyActivity } from '../store/familyStore';
import { api, expireSession } from '../api';

// Temps réel de l'app connectée :
// - connexion du socket avec le token
// - événements de la Tribu (demandes, membres, activités…)
// - resynchronisation au retour sur l'app (événements manqués pendant que le socket était coupé)
export default function useRealtime() {
  const userId = useUserStore(state => state.user?.id);
  const token = useUserStore(state => state.token);
  const familyId = useUserStore(state => state.user?.familyId);
  const setUser = useUserStore((state) => state.setUser);
  const setFamily = useFamilyStore((state) => state.setFamily);
  const setCurrentActivity = useFamilyStore((state) => state.setCurrentActivity);
  const setCompletedActivities = useFamilyStore((state) => state.setCompletedActivities);
  const setUnreadCount = useFamilyStore((state) => state.setUnreadCount);

  // Écran Chat affiché ? (les messages y sont lus directement, voir useFamilyChat)
  const location = useLocation();
  const isOnChatRef = useRef(false);
  useEffect(() => {
    isOnChatRef.current = location.pathname === '/chat';
  }, [location.pathname]);

  // Connexion du socket avec le token (le serveur refuse sans token valide)
  useEffect(() => {
    if (!token) return;

    // Token refusé par le serveur : session invalide, on déconnecte
    const handleConnectError = (error: Error) => {
      if (error.message === 'Non autorisé') expireSession();
    };

    socket.on('connect_error', handleConnectError);
    socket.connect();

    return () => {
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (!userId) return;

    // Rejoindre la room de la Tribu (la room perso est rejointe automatiquement par le serveur),
    // et de nouveau après chaque reconnexion
    const joinRooms = () => {
      if (familyId) socket.emit('joinFamilyRoom', familyId);
    };
    joinRooms();

    // Rattrape les événements manqués (app en arrière-plan, coupure réseau) :
    // on relit son profil et on met à jour sa Tribu si elle a changé
    // (ex : demande acceptée pendant que l'app était fermée).
    // Le changement de familyId suffit : useFamilyData charge alors la Tribu.
    const resync = async () => {
      try {
        const res = await api(`users/${userId}`);
        if (!res.ok) return;
        const me = await res.json();
        const newFamilyId: string | null = me.familyId ?? null;

        if (newFamilyId !== (familyId ?? null)) {
          setUser((prev) => (prev ? { ...prev, familyId: newFamilyId } : prev));
        }
      } catch (error) {
        console.error('Erreur resynchronisation :', error);
      }
    };

    // Nombre de messages non lus du chat (sauf si le chat est affiché : il se marque lu lui-même)
    const fetchUnreadCount = async () => {
      if (!familyId || isOnChatRef.current) return;
      try {
        const res = await api(`families/${familyId}/chat/unread`);
        if (!res.ok) return;
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      } catch (error) {
        console.error('Erreur messages non lus :', error);
      }
    };
    if (familyId) fetchUnreadCount();
    else setUnreadCount(0);

    // Nouveau message d'un autre membre, chat non affiché : un non lu de plus
    const handleNewMessage = (message: { sender?: { _id?: string } }) => {
      if (isOnChatRef.current || message.sender?._id === userId) return;
      setUnreadCount((count) => count + 1);
    };

    // Reconnexion du socket : on rejoint la room de la Tribu et on resynchronise
    const handleConnect = () => {
      joinRooms();
      resync();
      fetchUnreadCount();
    };

    // Retour sur l'app (onglet ou PWA de nouveau au premier plan)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resync();
        fetchUnreadCount();
      }
    };

    // Handlers stables
    // Nouvelle demande : on recharge la Tribu, qui contient les demandes avec les noms
    const handleNewJoinRequest = async (data: { familyId: string; userId: string }) => {
      try {
        const res = await api(`families/${data.familyId}`);
        const result = await res.json();
        if (!res.ok || !result.family) return;

        setFamily((prev) => {
          if (!prev || prev.id !== data.familyId) return prev;

          // On vérifie qu'on est bien le créateur
          if (prev.creatorId !== userId) return prev;

          return { ...prev, joinRequests: result.family.joinRequests };
        });
      } catch (error) {
        console.error('Erreur chargement demande pour rejoindre :', error);
      }
    };

    // Fusionne les infos reçues avec la famille déjà en mémoire
    const handleFamilyUpdated = (data: Partial<Family>) => {
      setFamily((prev) => (prev ? { ...prev, ...data } : prev));
    };

    // Demande acceptée : le changement de familyId suffit,
    // useFamilyData charge alors la Tribu complète (avec ses membres)
    const handleFamilyAccepted = (data: { familyId: string }) => {
      setUser((prevUser) =>
        prevUser ? { ...prevUser, familyId: data.familyId } : prevUser
      );
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
        const res = await api(`users?familyId=${familyId}`);
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
            api(`families/${familyId}`),
            api(`users?familyId=${familyId}`),
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
    socket.on('connect', handleConnect);
    socket.on('newMessage', handleNewMessage);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    socket.on('newJoinRequest', handleNewJoinRequest);
    socket.on('familyUpdated', handleFamilyUpdated);
    socket.on('familyAccepted', handleFamilyAccepted);
    socket.on('joinRequestRemoved', handleJoinRequestRemoved);
    socket.on('memberJoined', handleMemberJoined);
    socket.on('familyActivityUpdated', handleFamilyActivityUpdated);

    // Nettoyage
    return () => {
      socket.off('connect', handleConnect);
      socket.off('newMessage', handleNewMessage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      socket.off('newJoinRequest', handleNewJoinRequest);
      socket.off('familyUpdated', handleFamilyUpdated);
      socket.off('familyAccepted', handleFamilyAccepted);
      socket.off('joinRequestRemoved', handleJoinRequestRemoved);
      socket.off('memberJoined', handleMemberJoined);
      socket.off('familyActivityUpdated', handleFamilyActivityUpdated);
    };
  }, [userId, familyId]);
}
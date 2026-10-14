import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Award, CalendarCheck, Trophy, UserCheck, UserPlus, Users, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import type { AppNotification, NotificationType } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api';

const REFUSE_RED = '#E5392A';

// Icône, titre et texte de chaque type de notification
const CONTENT: Record<NotificationType, { Icon: LucideIcon; title: string; text: (d: AppNotification['data']) => string }> = {
  join_request: { Icon: UserPlus, title: 'Nouvelle demande', text: d => `${d.userName} souhaite rejoindre votre Tribu.` },
  request_accepted: { Icon: UserCheck, title: 'Demande acceptée', text: d => `Bienvenue dans « ${d.familyName} » !` },
  request_rejected: {
    Icon: UserX,
    title: 'Demande refusée',
    text: d => `Ta demande pour rejoindre « ${d.familyName} » n'a pas été acceptée.`,
  },
  member_joined: { Icon: Users, title: 'Nouveau membre', text: d => `${d.userName} a rejoint la Tribu.` },
  activity_started: {
    Icon: CalendarCheck,
    title: 'Nouvelle activité',
    text: d => `${d.userName} a choisi « ${d.activityName} » pour la Tribu.`,
  },
  activity_completed: {
    Icon: Award,
    title: 'Activité terminée',
    text: d => `« ${d.activityName} » est validée : +${d.points ?? 0} pts pour la Tribu !`,
  },
  badge_unlocked: { Icon: Trophy, title: 'Nouveau badge', text: d => `Votre Tribu a débloqué « ${d.badgeName} » !` },
};

// "À l'instant", "Il y a 5 min", "Il y a 2 h", "Hier", "Il y a 3 jours", puis la date
const timeAgo = (date: string) => {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

const STATUS_LABELS = { accepted: 'Demande acceptée', rejected: 'Demande refusée', cancelled: 'Demande annulée' };

interface NotificationPanelProps {
  onClose: () => void;
}

// Panneau des notifications, ouvert depuis la cloche (Figma : panneau-notifications)
export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const notifications = useFamilyStore(state => state.notifications);
  const setNotifications = useFamilyStore(state => state.setNotifications);
  const setUnreadNotifications = useFamilyStore(state => state.setUnreadNotifications);
  const setFamily = useFamilyStore(state => state.setFamily);

  // Non lues à l'ouverture : le point vert reste affiché tant que le panneau est ouvert
  const [unreadIds] = useState(() => new Set(notifications.filter(n => !n.read).map(n => n.id)));
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  // Ouvrir le panneau marque tout comme lu
  useEffect(() => {
    if (unreadIds.size === 0) return;
    setUnreadNotifications(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    api('notifications/read', { method: 'PATCH' }).catch(error => console.error('Erreur notifications lues :', error));
  }, [unreadIds, setNotifications, setUnreadNotifications]);

  // Échap ferme le panneau
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const setStatus = (id: string, status: 'accepted' | 'rejected' | 'cancelled') =>
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, data: { ...n.data, status } } : n)));

  // Accepter ou refuser une demande pour rejoindre la Tribu
  const respond = async (notification: AppNotification, accept: boolean) => {
    const { familyId, userId } = notification.data;
    if (!familyId || !userId || respondingId) return;
    setRespondingId(notification.id);
    setErrorId(null);
    try {
      const response = await api(`families/${familyId}/join-requests/${userId}`, { method: 'PATCH', body: { accept } });
      if (response.ok) {
        setStatus(notification.id, accept ? 'accepted' : 'rejected');
        const data = await response.json();
        if (data.family) setFamily(prev => (prev ? { ...prev, joinRequests: data.family.joinRequests } : prev));
        // La liste des membres est rechargée par l'événement socket `memberJoined`
      } else if (response.status === 400) {
        // Demande qui n'existe plus (annulée, ou personne acceptée ailleurs)
        setStatus(notification.id, 'cancelled');
      } else {
        setErrorId(notification.id);
      }
    } catch (error) {
      console.error('Erreur réponse demande :', error);
      setErrorId(notification.id);
    } finally {
      setRespondingId(null);
    }
  };

  // Toucher une notification ouvre l'écran concerné
  const open = (notification: AppNotification) => {
    const { activityId, badgeId } = notification.data;
    switch (notification.type) {
      case 'activity_started':
      case 'activity_completed':
        if (activityId) navigate(`/activites/${activityId}`);
        break;
      case 'badge_unlocked':
        if (badgeId) navigate(`/recompenses/badges/${badgeId}`);
        break;
      case 'request_rejected':
        navigate('/tribu/rechercher');
        break;
      default:
        break;
    }
    if (notification.type !== 'join_request') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0 24px', paddingTop: 'calc(68px + env(safe-area-inset-top))' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        className="bg-white w-full flex flex-col self-start"
        style={{
          maxWidth: 382,
          maxHeight: 'calc(100% - 100px - env(safe-area-inset-top))',
          borderRadius: 16,
          padding: '16px 16px 12px',
          gap: 4,
          filter: 'drop-shadow(0px 12px 16px rgba(0, 0, 0, 0.16))',
        }}
        onClick={e => e.stopPropagation()}
      >
        <span className="font-outfit-bold shrink-0" style={{ fontSize: 17, lineHeight: 1.4, color: '#161616', paddingBottom: 8 }}>
          Notifications
        </span>

        <div className="overflow-y-auto no-scrollbar flex flex-col" style={{ gap: 4 }}>
          {notifications.length === 0 && (
            <p className="font-outfit m-0" style={{ fontSize: 14, color: '#99A19E', padding: '8px 0 12px' }}>
              Aucune notification pour le moment.
            </p>
          )}

          {notifications.map(notification => {
            const content = CONTENT[notification.type];
            if (!content) return null;
            const { Icon } = content;
            const isUnread = unreadIds.has(notification.id);
            const status = notification.data.status;
            const isPendingRequest = notification.type === 'join_request' && status === 'pending';
            const isClickable = notification.type !== 'join_request';

            return (
              <div
                key={notification.id}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={isClickable ? () => open(notification) : undefined}
                className="flex items-start shrink-0"
                style={{
                  border: '1px solid #CBD5E0',
                  borderRadius: 14,
                  padding: 12,
                  gap: 12,
                  // Déjà lue avant l'ouverture du panneau : plus discrète (fond grisé)
                  backgroundColor: isUnread ? '#FFFFFF' : '#F6F7F9',
                  cursor: isClickable ? 'pointer' : 'default',
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.transparent }}
                >
                  <Icon size={20} color={theme.primary} strokeWidth={1.75} />
                </span>

                <div className="flex-1 min-w-0 flex flex-col items-start" style={{ gap: 2, lineHeight: 1.4 }}>
                  <span className="font-outfit-bold" style={{ fontSize: 14, color: '#161616' }}>{content.title}</span>
                  <span className="font-outfit" style={{ fontSize: 13, color: '#6B7570' }}>{content.text(notification.data)}</span>
                  <span className="font-outfit" style={{ fontSize: 12, color: '#99A19E' }}>{timeAgo(notification.createdAt)}</span>

                  {/* Demande en attente : réponse directement depuis la notification */}
                  {isPendingRequest ? (
                    <div className="flex" style={{ gap: 8, paddingTop: 6 }}>
                      <button
                        onClick={() => respond(notification, false)}
                        disabled={respondingId === notification.id}
                        className="font-outfit-bold text-white"
                        style={{ fontSize: 13, padding: '7px 14px', borderRadius: 10, border: 'none', backgroundColor: REFUSE_RED }}
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => respond(notification, true)}
                        disabled={respondingId === notification.id}
                        className="font-outfit-bold text-white"
                        style={{ fontSize: 13, padding: '7px 14px', borderRadius: 10, border: 'none', backgroundColor: theme.primary }}
                      >
                        Accepter
                      </button>
                    </div>
                  ) : notification.type === 'join_request' && status && status !== 'pending' ? (
                    <span
                      className="font-outfit-bold"
                      style={{ fontSize: 13, paddingTop: 4, color: status === 'accepted' ? theme.primary : '#99A19E' }}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  ) : null}

                  {errorId === notification.id && (
                    <span className="font-outfit" style={{ fontSize: 12, color: REFUSE_RED }}>
                      Impossible de répondre. Réessaie plus tard.
                    </span>
                  )}
                </div>

                {isUnread && (
                  <span className="shrink-0 rounded-full" style={{ width: 8, height: 8, marginTop: 6, backgroundColor: theme.primary }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

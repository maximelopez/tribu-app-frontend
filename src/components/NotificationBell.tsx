import { Bell } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';

// Bouton cloche de l'Accueil, avec le nombre de notifications non lues (Figma : bouton-notifications)
export default function NotificationBell({ onPress }: { onPress: () => void }) {
  const unread = useFamilyStore(state => state.unreadNotifications);

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={unread > 0 ? `Notifications, ${unread} non lue${unread > 1 ? 's' : ''}` : 'Notifications'}
      className="relative bg-white flex items-center justify-center shrink-0"
      style={{ width: 44, height: 44, borderRadius: 22, border: 'none', filter: 'drop-shadow(0px 2px 4px rgba(13, 23, 18, 0.1))' }}
    >
      <Bell size={24} color="#161616" strokeWidth={1.75} />
      {unread > 0 && (
        <span
          className="absolute flex items-center justify-center font-outfit-bold text-white"
          style={{
            left: 26,
            top: -2,
            minWidth: 18,
            height: 18,
            padding: '0 4px',
            borderRadius: 9,
            border: '2px solid #FFFFFF',
            backgroundColor: '#E5392A',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}

import { NavLink } from 'react-router';
import { House, Trophy, TicketCheck, MessagesCircle, User } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import useKeyboardOpen from '../hooks/useKeyboardOpen';

// Couleurs Figma (composant navigation-bar-classic)
const ACTIVE = '#161616';
const INACTIVE = '#969696';

const TABS = [
  { to: '/', label: 'Accueil', Icon: House, end: true },
  { to: '/recompenses', label: 'Récompenses', Icon: Trophy, end: false },
  { to: '/activites', label: 'Activités', Icon: TicketCheck, end: true },
  { to: '/chat', label: 'Chat', Icon: MessagesCircle, end: false },
  { to: '/profil', label: 'Profil', Icon: User, end: false },
];

// Barre de navigation flottante (pilule blanche) - maquette Figma V2.
// Masquée quand le clavier est ouvert : elle reste en bas, sous le clavier, au lieu de remonter avec lui.
export default function TabBar() {
  const unreadCount = useFamilyStore(state => state.unreadCount);
  const keyboardOpen = useKeyboardOpen();

  if (keyboardOpen) return null;

  return (
    <nav
      className="shrink-0"
      style={{
        backgroundColor: '#F3F3F8',
        padding: '8px 7px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="flex bg-white rounded-full"
        style={{ height: 60, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.08)' }}
      >
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            replace
            className="flex-1 flex flex-col items-center justify-center no-underline"
            style={{ gap: 6, padding: '0 2px' }}
          >
            {({ isActive }) => {
              const color = isActive ? ACTIVE : INACTIVE;
              return (
                <>
                  <span className="relative flex">
                    <Icon size={22} color={color} strokeWidth={2} />
                    {/* Point rouge : messages non lus (Figma : badge-notification) */}
                    {to === '/chat' && unreadCount > 0 && (
                      <span
                        aria-label="Messages non lus"
                        className="absolute"
                        style={{
                          top: -3,
                          right: -4,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#E5392A',
                          border: '2px solid #FFFFFF',
                        }}
                      />
                    )}
                  </span>
                  <span className="font-montserrat-semibold whitespace-nowrap" style={{ fontSize: 9, color }}>
                    {label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

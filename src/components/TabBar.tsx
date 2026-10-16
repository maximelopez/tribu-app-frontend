import { NavLink } from 'react-router';
import { House, Trophy, TicketCheck, MessageCircle, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFamilyStore } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import useKeyboardOpen from '../hooks/useKeyboardOpen';

// Couleurs Figma (composant navigation-bar-tribu)
const ACTIVE = '#161616';
const INACTIVE = '#5F5F5F';

// Onglets de chaque côté du bouton central « Activités »
const LEFT_TABS = [
  { to: '/', label: 'Accueil', Icon: House, end: true },
  { to: '/recompenses', label: 'Récompenses', Icon: Trophy, end: false },
];
const RIGHT_TABS = [
  { to: '/chat', label: 'Chat', Icon: MessageCircle, end: false },
  { to: '/profil', label: 'Profil', Icon: User, end: false },
];

// Hauteur du bouton central qui dépasse au-dessus de la barre (Figma : 18 px)
const CENTER_OVERFLOW = 18;

// Libellé d'un onglet : gras et foncé quand l'onglet est ouvert
const TabLabel = ({ label, isActive }: { label: string; isActive: boolean }) => (
  <span
    className={`${isActive ? 'font-outfit-bold' : 'font-outfit'} whitespace-nowrap`}
    style={{ fontSize: 13, lineHeight: '16px', color: isActive ? ACTIVE : INACTIVE }}
  >
    {label}
  </span>
);

// Barre de navigation flottante (pilule blanche) avec le bouton « Activités » au centre - maquette Figma V2.
// Masquée quand le clavier est ouvert : elle reste en bas, sous le clavier, au lieu de remonter avec lui.
export default function TabBar() {
  const unreadCount = useFamilyStore(state => state.unreadCount);
  const { theme } = useTheme();
  const keyboardOpen = useKeyboardOpen();

  if (keyboardOpen) return null;

  // Onglet classique : icône dans un indicateur coloré quand il est ouvert, puis le libellé
  const tab = ({ to, label, Icon, end }: { to: string; label: string; Icon: LucideIcon; end: boolean }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      replace
      className="flex-1 flex flex-col items-center justify-center no-underline"
      style={{ gap: 4, minWidth: 0 }}
    >
      {({ isActive }) => (
        <>
          <span
            className="relative flex items-center justify-center"
            style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: isActive ? theme.transparent : 'transparent' }}
          >
            <Icon size={22} color={isActive ? ACTIVE : INACTIVE} strokeWidth={2} />
            {/* Point rouge : messages non lus (Figma : pastille-message) */}
            {to === '/chat' && unreadCount > 0 && (
              <span
                aria-label="Messages non lus"
                className="absolute"
                style={{
                  top: 3,
                  right: 10,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#C62F22',
                  border: '2px solid #FFFFFF',
                  boxSizing: 'content-box',
                }}
              />
            )}
          </span>
          <TabLabel label={label} isActive={isActive} />
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      className="shrink-0"
      style={{
        padding: '0 7px 8px',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="relative" style={{ paddingTop: CENTER_OVERFLOW }}>
        <div
          className="flex bg-white rounded-full"
          style={{ height: 72, padding: '0 8px', boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.10)' }}
        >
          {LEFT_TABS.map(tab)}

          {/* Bouton central « Activités » : rond de la couleur du thème, qui dépasse au-dessus de la barre */}
          <NavLink
            to="/activites"
            end
            replace
            className="flex-1 flex flex-col items-center justify-end no-underline"
            style={{ minWidth: 0, paddingBottom: 10 }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="absolute flex items-center justify-center"
                  style={{ top: 0, left: '50%', transform: 'translateX(-50%)', width: 64, height: 64 }}
                >
                  {/* Halo quand l'onglet est ouvert (Figma : halo) */}
                  {isActive && (
                    <span
                      className="absolute rounded-full"
                      style={{ width: 76, height: 76, backgroundColor: theme.transparent }}
                    />
                  )}
                  <span className="absolute rounded-full bg-white" style={{ width: 64, height: 64 }} />
                  <span
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      width: 54,
                      height: 54,
                      backgroundColor: theme.primary,
                      boxShadow: `0px 4px 12px rgba(0, 0, 0, ${isActive ? 0.22 : 0.14})`,
                    }}
                  >
                    <TicketCheck size={26} color="#FFFFFF" strokeWidth={2} />
                  </span>
                </span>
                <TabLabel label="Activités" isActive={isActive} />
              </>
            )}
          </NavLink>

          {RIGHT_TABS.map(tab)}
        </div>
      </div>
    </nav>
  );
}

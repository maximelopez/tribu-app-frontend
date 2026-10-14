import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import useFamilyBadges from '../hooks/useFamilyBadges';
import ScreenHeader from '../components/ScreenHeader';
import BadgeCard from '../components/BadgeCard';
import Spinner from '../components/Spinner';
import { mascotte1 } from '../assets';

// Tous les badges de la Tribu (Figma : tous-les-badges)
export default function AllBadges() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data, loading } = useFamilyBadges();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Récompenses" />

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size={36} color={theme.primary} />
        </div>
      ) : (
        <div
          className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
          style={{ padding: '8px 16px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))', gap: 12 }}
        >
          {/* Carte d'introduction */}
          <div
            className="bg-white flex flex-col items-center shrink-0"
            style={{ padding: 16, gap: 12, borderRadius: 24, filter: 'drop-shadow(0px 4px 6px rgba(22, 22, 22, 0.04))' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 135, height: 135, marginTop: 12, backgroundColor: 'rgba(34, 195, 176, 0.12)' }}
            >
              <img src={mascotte1} alt="" style={{ width: 115, height: 115, objectFit: 'contain' }} />
            </div>
            <p className="font-outfit text-base text-center m-0" style={{ lineHeight: 'normal', color: '#161616' }}>
              Continuez à faire des activités en famille pour débloquer la collection des badges !
            </p>
          </div>

          {data?.badges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} onPress={() => navigate(`/recompenses/badges/${badge.id}`)} />
          ))}

          {!data && (
            <p className="font-outfit text-base text-center m-0" style={{ color: '#969696', paddingTop: 12 }}>
              Impossible de charger les badges. Réessaie plus tard.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

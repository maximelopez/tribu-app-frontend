import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import useFamilyBadges from '../hooks/useFamilyBadges';
import ScreenHeader from '../components/ScreenHeader';
import NoFamilyState from '../components/NoFamilyState';
import BadgeCard from '../components/BadgeCard';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { mascotteLunettes } from '../assets';

// Onglet Récompenses : collection de badges de la Tribu (Figma : mes-badges, recompense-empty-state)

// Nombre de badges affichés dans « Prochains badges »
const NEXT_BADGES_COUNT = 3;
export default function Rewards() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const familyId = useUserStore(state => state.user?.familyId);
  const { data, loading } = useFamilyBadges();

  // Pas encore de Tribu
  if (!familyId) {
    return (
      <NoFamilyState
        message="Rejoins ou crée ta Tribu pour gagner tes premiers points et badges !"
        image={mascotteLunettes}
        circleColor="rgba(255, 157, 0, 0.1)"
      />
    );
  }

  const lastUnlocked = data?.lastUnlocked ?? null;
  // Prochains badges : ceux pas encore obtenus les plus avancés (en pourcentage de l'objectif)
  const nextBadges = (data?.badges ?? [])
    .filter(b => !b.unlocked)
    .sort((a, b) => b.progress / b.goal - a.progress / a.goal)
    .slice(0, NEXT_BADGES_COUNT);
  const openBadge = (badgeId: string) => navigate(`/recompenses/badges/${badgeId}`);
  const progressPercent = data && data.total > 0 ? Math.round((data.unlockedCount / data.total) * 100) : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Récompenses" showBack={false} />

      {loading && !data ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size={36} color={theme.primary} />
        </div>
      ) : data ? (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col" style={{ padding: '8px 16px 24px', gap: 12 }}>
          {/* Ta collection */}
          <div className="flex flex-col shrink-0" style={{ gap: 10 }}>
            <div className="flex items-center justify-between text-base">
              <span className="font-outfit-bold" style={{ color: '#161616' }}>Ta collection</span>
              <span className="font-outfit" style={{ color: '#969696' }}>
                {data.unlockedCount} / {data.total} débloqué{data.unlockedCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-hidden" style={{ height: 8, borderRadius: 9999, backgroundColor: '#E2E5F0' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 9999, backgroundColor: theme.primary }} />
            </div>
          </div>

          {/* Dernier badge gagné */}
          {lastUnlocked && (
            <div className="flex flex-col shrink-0" style={{ gap: 12, marginTop: 8 }}>
              <span className="font-outfit-bold text-base" style={{ color: '#000000' }}>Dernier badge gagné</span>
              <BadgeCard badge={lastUnlocked} onPress={() => openBadge(lastUnlocked.id)} />
            </div>
          )}

          {/* Prochains badges */}
          {nextBadges.length > 0 && (
            <div className="flex flex-col shrink-0" style={{ gap: 12, marginTop: lastUnlocked ? 0 : 8 }}>
              <span className="font-outfit-bold text-base" style={{ color: '#000000' }}>Prochains badges</span>
              {nextBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} onPress={() => openBadge(badge.id)} />
              ))}
            </div>
          )}

          <div className="shrink-0" style={{ marginTop: 'auto', paddingTop: 24 }}>
            <Button title="Voir tous les badges" onPress={() => navigate('/recompenses/badges')} color={theme.primary} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center" style={{ padding: '0 28px' }}>
          <p className="font-outfit text-base text-center m-0" style={{ color: '#969696' }}>
            Impossible de charger les badges. Réessaie plus tard.
          </p>
        </div>
      )}
    </div>
  );
}

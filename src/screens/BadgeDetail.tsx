import { useParams } from 'react-router';
import { CalendarCheck, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import useFamilyBadges from '../hooks/useFamilyBadges';
import ScreenHeader from '../components/ScreenHeader';
import { BadgeIllustration, getBadgeColors } from '../components/BadgeCard';
import Spinner from '../components/Spinner';

const LOCKED_SHADOW = 'rgba(150, 150, 150, 0.1)';

// "Obtenu le 12 oct."
const formatUnlockedDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

// Détail d'un badge (Figma : details-badge si obtenu, details-badge-blocked sinon)
export default function BadgeDetail() {
  const { badgeId } = useParams();
  const { theme } = useTheme();
  const { data, loading } = useFamilyBadges();

  const badge = data?.badges.find(b => b.id === badgeId);

  if (!badge) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        <ScreenHeader title="Récompenses" />
        <div className="flex-1 flex items-center justify-center" style={{ padding: '0 28px' }}>
          {loading ? (
            <Spinner size={36} color={theme.primary} />
          ) : (
            <p className="font-outfit text-base text-center m-0" style={{ color: '#969696' }}>Badge introuvable.</p>
          )}
        </div>
      </div>
    );
  }

  const progressPercent = badge.goal > 0 ? Math.round((badge.progress / badge.goal) * 100) : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Récompenses" />

      <div
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
        style={{ padding: '8px 16px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
      >
        <div
          className="bg-white flex flex-col items-center shrink-0"
          style={{
            padding: 24,
            gap: 20,
            borderRadius: 16,
            filter: `drop-shadow(0px 4px 6px ${badge.unlocked ? getBadgeColors(badge).shadow : LOCKED_SHADOW})`,
          }}
        >
          <BadgeIllustration badge={badge} size={120} />

          {/* Nom et texte du badge */}
          <div className="flex flex-col items-center w-full" style={{ gap: 6 }}>
            <h1 className="font-outfit-bold font-normal text-center m-0" style={{ fontSize: 32, lineHeight: 'normal', color: '#161616' }}>
              {badge.name}
            </h1>
            <p className="font-outfit text-base m-0 w-full" style={{ lineHeight: 'normal', color: '#777777' }}>
              {badge.details}
            </p>
            {badge.unlocked && badge.nextBadge && (
              <p className="font-outfit text-base m-0 w-full" style={{ lineHeight: 'normal', color: '#777777', marginTop: 18 }}>
                Prochain palier : {badge.nextBadge.name}, avec {badge.nextBadge.goalText}.
              </p>
            )}
          </div>

          {badge.unlocked ? (
            // Obtenu : pastille avec la date
            <div
              className="flex items-center"
              style={{ gap: 8, padding: '8px 16px', borderRadius: 9999, backgroundColor: theme.transparent }}
            >
              <CalendarCheck size={18} color={theme.primary} strokeWidth={2} />
              <span className="font-outfit-bold text-base" style={{ lineHeight: 'normal', color: theme.primary }}>
                {badge.unlockedAt ? `Obtenu le ${formatUnlockedDate(badge.unlockedAt)}` : 'Obtenu'}
              </span>
            </div>
          ) : (
            // Pas encore obtenu : progression
            <div className="flex flex-col w-full" style={{ gap: 10 }}>
              <div className="flex items-center justify-between text-base">
                <span className="flex items-center font-outfit-bold" style={{ gap: 8, color: '#161616' }}>
                  <Lock size={16} color="#161616" strokeWidth={2} />
                  Pas encore obtenu
                </span>
                <span className="font-outfit" style={{ color: '#777777' }}>
                  {badge.progress} / {badge.goal}
                </span>
              </div>
              <div className="overflow-hidden" style={{ height: 8, borderRadius: 9999, backgroundColor: '#E2E5F0' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 9999, backgroundColor: theme.primary }} />
              </div>
              {badge.remainingText && (
                <p className="font-outfit m-0" style={{ fontSize: 14, lineHeight: 'normal', color: '#777777' }}>
                  {badge.remainingText}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

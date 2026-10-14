import { useNavigate, useParams } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import useFamilyBadges from '../hooks/useFamilyBadges';
import ScreenHeader from '../components/ScreenHeader';
import ActivityCard from '../components/ActivityCard';
import { BadgeIllustration, getBadgeColors } from '../components/BadgeCard';
import Spinner from '../components/Spinner';

// Détail d'un badge : description, progression et, pour un badge de catégorie, les activités faites par la Tribu
// (Figma : details-badge)
export default function BadgeDetail() {
  const { badgeId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, loading } = useFamilyBadges();
  const completedActivities = useFamilyStore(state => state.completedActivities);

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

  const colors = getBadgeColors(badge);
  const progressPercent = badge.goal > 0 ? Math.round((badge.progress / badge.goal) * 100) : 0;
  const relatedActivities = badge.category
    ? completedActivities.filter(fa => fa.activity?.category === badge.category)
    : [];

  const openActivityDetail = (familyActivity: FamilyActivity) => {
    const activity = toCatalogActivity(familyActivity);
    navigate(`/activites/${activity._id}`, { state: { activity } });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Récompenses" />

      <div
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
        style={{ padding: '8px 16px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', gap: 20 }}
      >
        {/* Carte du badge */}
        <div
          className="bg-white flex flex-col items-center shrink-0"
          style={{
            padding: 24,
            gap: 16,
            borderRadius: 16,
            filter: `drop-shadow(0px 4px 6px ${badge.unlocked ? colors.shadow : 'rgba(150, 150, 150, 0.1)'})`,
          }}
        >
          <BadgeIllustration badge={badge} size={120} />
          <div className="flex flex-col items-center w-full" style={{ gap: 6 }}>
            <h1
              className="font-outfit-bold font-normal text-center m-0"
              style={{ fontSize: 32, lineHeight: 'normal', color: badge.unlocked ? '#161616' : '#969696' }}
            >
              {badge.name}
            </h1>
            <p className="font-outfit text-base m-0 w-full" style={{ lineHeight: 'normal', color: '#777777' }}>
              {badge.details}
            </p>
          </div>
        </div>

        {/* Progression */}
        <div className="flex flex-col shrink-0" style={{ gap: 10 }}>
          <div className="flex items-center justify-between text-base">
            <span className="font-outfit-bold" style={{ color: '#161616' }}>Progression</span>
            <span className="font-outfit" style={{ color: '#969696' }}>
              {badge.progress} / {badge.goal}{badge.unlocked ? ' · obtenu' : ''}
            </span>
          </div>
          <div className="overflow-hidden" style={{ height: 8, borderRadius: 9999, backgroundColor: '#E2E5F0' }}>
            <div style={{ width: `${progressPercent}%`, height: '100%', borderRadius: 9999, backgroundColor: theme.primary }} />
          </div>
        </div>

        {/* Activités concernées (badges de catégorie) : celles de la catégorie déjà terminées par la Tribu */}
        {badge.category && (
          <div className="flex flex-col shrink-0" style={{ gap: 12 }}>
            <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>Activités concernées</span>
            {relatedActivities.length > 0 ? (
              relatedActivities.map(fa => (
                <ActivityCard
                  key={fa.id}
                  name={fa.activity.name}
                  description={fa.activity.description}
                  isPartner={fa.activity.isPartner}
                  offer={fa.activity.offer}
                  imageUrl={fa.activity.imageUrl}
                  category={fa.activity.category}
                  points={fa.pointsPerMember ?? fa.activity.points}
                  onPress={() => openActivityDetail(fa)}
                />
              ))
            ) : (
              <p className="font-outfit m-0" style={{ fontSize: 14, color: '#969696' }}>
                Aucune activité terminée dans cette catégorie pour l'instant.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

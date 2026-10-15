import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import NotificationPanel from '../components/NotificationPanel';
import FamilyLeaderboard from '../components/FamilyLeaderboard';
import ActivityCarousel from '../components/ActivityCarousel';
import useCatalog, { sortByNewest } from '../hooks/useCatalog';
import Spinner from '../components/Spinner';
import PendingRequestCard from '../components/PendingRequestCard';
import { chevronRightGrey, chevronRightWhite, getActivityImage, mascotte1, mascotteActivity, usersGroupIcon } from '../assets';
import FloatingMascot from '../components/FloatingMascot';

const CARD_SHADOW = '0px 4px 6px rgba(22, 22, 22, 0.08)';

export default function Home() {
  const user = useUserStore(state => state.user);
  const family = useFamilyStore(state => state.family);
  const isLoadingFamily = useFamilyStore(state => state.isLoadingFamily);
  const currentActivity = useFamilyStore(state => state.currentActivity);
  const completedActivities = useFamilyStore(state => state.completedActivities);
  const pendingRequest = useFamilyStore(state => state.pendingRequest);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { activities: catalog } = useCatalog();

  const [showNotifications, setShowNotifications] = useState(false);

  // Idées d'activités : dans la ville de la Tribu (ou partout), pas encore faites ni en cours
  const familyCity = family?.city;
  const suggestions = useMemo(() => {
    const doneIds = new Set(completedActivities.map(fa => toCatalogActivity(fa)._id));
    if (currentActivity) doneIds.add(toCatalogActivity(currentActivity)._id);
    return catalog.filter(a => !doneIds.has(a._id) && (!familyCity || !a.city || a.city === familyCity));
  }, [catalog, completedActivities, currentActivity, familyCity]);
  const newest = useMemo(() => sortByNewest(suggestions).slice(0, 6), [suggestions]);

  if (!user) return null;

  // Carte du haut quand on n'a pas de Tribu : mascotte + texte
  const introCard = (text: string) => (
    <div
      className="w-full bg-white flex flex-col items-center p-4 gap-3 mb-4"
      style={{ borderRadius: 24, boxShadow: '0px 4px 6px rgba(22, 22, 22, 0.04)' }}
    >
      <div className="w-full flex items-center justify-center" style={{ height: 160 }}>
        <FloatingMascot image={mascotte1} circleColor="rgba(32, 193, 177, 0.1)" />
      </div>
      <p className="font-outfit text-base text-center m-0" style={{ color: '#161616' }}>{text}</p>
    </div>
  );

  // Ouvre le détail d'une activité de la Tribu (en cours ou terminée)
  const openActivityDetail = (familyActivity: FamilyActivity) => {
    const activity = toCatalogActivity(familyActivity);
    navigate(`/activites/${activity._id}`, { state: { activity } });
  };

  // Nombre d'activités terminées par membre (pour le classement)
  const activityCounts: Record<string, number> = {};
  completedActivities.forEach(fa =>
    fa.participants.forEach(p => {
      activityCounts[p.id] = (activityCounts[p.id] ?? 0) + 1;
    })
  );
  const isActivityStarter = currentActivity?.startedBy === user.id;
  const currentIllustration = currentActivity ? getActivityImage(currentActivity.activity) : null;

  const smallButton = (label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className="rounded-2xl flex items-center justify-center font-outfit-bold text-base text-white"
      style={{ height: 30, padding: '0 12px', backgroundColor: theme.primary, border: 'none' }}
    >
      {label}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 24 }}>
      {/* Bonjour, Prénom + cloche des notifications */}
      <div className="w-full px-4 pt-4 flex items-center justify-between" style={{ gap: 12 }}>
        <h1 className="font-outfit-bold text-2xl font-normal m-0 min-w-0 truncate" style={{ color: '#161616' }}>
          Bonjour, <span style={{ color: theme.primary }}>{user.name}</span>
        </h1>
        <NotificationBell onPress={() => setShowNotifications(true)} />
      </div>
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}

      <div className="px-4 mt-4">
        {isLoadingFamily && !family ? (
          <div className="mt-6 flex justify-center">
            <Spinner size={36} color={theme.primary} />
          </div>
        ) : family ? (
          <div className="w-full flex flex-col gap-3">
            {/* Carte tribu : nom, niveau, classement */}
            <FamilyLeaderboard
              familyName={family.name}
              members={family.members ?? []}
              currentUserId={user.id}
              levelInfo={family.levelInfo}
              activityCounts={activityCounts}
            />

            {/* Activité en cours, ou rien de prévu */}
            <div
              className="flex items-center bg-white rounded-2xl p-5"
              style={{ border: `1px solid ${theme.primary}`, boxShadow: `0px 4px 10px ${theme.transparent}`, gap: 10 }}
            >
              {/* Activité en cours : sa photo ou son illustration (Figma : activy-validate). Sinon : la mascotte */}
              {currentIllustration ? (
                <img
                  src={currentIllustration}
                  alt=""
                  className="shrink-0"
                  style={{ width: 65, height: 65, borderRadius: 16, objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 65, height: 65, backgroundColor: theme.transparent }}
                >
                  <img src={mascotteActivity} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                </div>
              )}
              <div className="flex-1 flex flex-col items-start" style={{ gap: 10 }}>
                {currentActivity ? (
                  <>
                    <div className="flex flex-col" style={{ gap: 2 }}>
                      <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>
                        {currentActivity.activity.name} à valider
                      </span>
                      <span className="font-outfit text-sm" style={{ color: '#161616' }}>
                        {isActivityStarter ? 'Validez-la pour gagner vos points !' : 'Activité en cours dans votre Tribu'}
                      </span>
                    </div>
                    {smallButton(isActivityStarter ? 'Valider' : 'Voir', () => openActivityDetail(currentActivity))}
                  </>
                ) : (
                  <>
                    <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>
                      Rien de prévu cette semaine
                    </span>
                    {smallButton('Trouver une activité', () => navigate('/activites'))}
                  </>
                )}
              </div>
            </div>

            {/* Idées d'activités (Figma : homepage-tribu) */}
            {suggestions.length > 0 && (
              <div className="flex flex-col" style={{ margin: '6px -16px 0', gap: 12 }}>
                <ActivityCarousel
                  title="Où sortir avec ta Tribu ?"
                  titleSize={16}
                  activities={suggestions}
                  onSeeAll={() => navigate('/activites')}
                />
                <ActivityCarousel
                  title={family.city ? `Les nouveautés à ${family.city}` : 'Les nouveautés'}
                  titleSize={16}
                  activities={newest}
                  onSeeAll={() => navigate('/activites')}
                />
              </div>
            )}
          </div>
        ) : pendingRequest ? (
          <>
            {/* Demande en attente (Figma : homepage-demande-en-attente) */}
            {introCard('Ta demande est en cours de validation.')}

            <PendingRequestCard />
          </>
        ) : (
          <>
            {/* Carte illustration */}
            {introCard('Commencez par rejoindre ou créer votre Tribu pour vivre des activités en famille')}

            {/* Boutons Rejoindre / Créer */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => navigate('/tribu/rechercher')}
                className="flex items-center text-left"
                style={{
                  gap: 16,
                  borderRadius: 16,
                  height: 101,
                  padding: '0 21px',
                  border: 'none',
                  boxShadow: CARD_SHADOW,
                  // Dégradé Figma : Color -> Color-Gradient, de gauche à droite
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.gradient})`,
                }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <img src={usersGroupIcon} alt="" width={24} height={24} />
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="font-outfit-bold text-base text-white">Rejoindre une Tribu</span>
                  <span className="font-outfit text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
                    Trouve ta Tribu dans la liste de recherche
                  </span>
                </span>
                <img src={chevronRightWhite} alt="" width={24} height={24} />
              </button>

              <button
                onClick={() => navigate('/tribu/creer')}
                className="flex items-center gap-4 bg-white text-left"
                style={{ boxShadow: CARD_SHADOW, borderRadius: 20, height: 101, padding: '0 20px', border: 'none' }}
              >
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: '#CBD5E0', fontSize: 24, color: '#000' }}
                >
                  ＋
                </span>
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="font-outfit-bold text-base" style={{ color: '#111' }}>Créer une Tribu</span>
                  <span className="font-outfit text-sm" style={{ color: '#888' }}>Lance ton groupe et invite tes proches</span>
                </span>
                <img src={chevronRightGrey} alt="" width={24} height={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

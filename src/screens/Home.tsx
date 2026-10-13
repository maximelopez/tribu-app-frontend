import { useNavigate } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import { useTheme } from '../context/ThemeContext';
import JoinRequestItem from '../components/JoinRequestItem';
import FamilyLeaderboard from '../components/FamilyLeaderboard';
import ActivityCard from '../components/ActivityCard';
import Spinner from '../components/Spinner';
import { chevronRightGrey, chevronRightWhite, mascotte1, mascotteActivity, usersGroupIcon } from '../assets';

const CARD_SHADOW = '0px 4px 6px rgba(22, 22, 22, 0.08)';

export default function Home() {
  const user = useUserStore(state => state.user);
  const family = useFamilyStore(state => state.family);
  const isLoadingFamily = useFamilyStore(state => state.isLoadingFamily);
  const currentActivity = useFamilyStore(state => state.currentActivity);
  const completedActivities = useFamilyStore(state => state.completedActivities);
  const navigate = useNavigate();
  const { theme } = useTheme();

  if (!user) return null;

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
  const latestActivities = completedActivities.slice(0, 3);
  const isActivityStarter = currentActivity?.startedBy === user.id;

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
      {/* Bonjour, Prénom */}
      <div className="w-full px-4 pt-6">
        <h1 className="font-outfit-bold text-2xl font-normal m-0" style={{ color: '#161616' }}>
          Bonjour, <span style={{ color: theme.primary }}>{user.name}</span>
        </h1>
      </div>

      <div className="px-4 mt-4">
        {isLoadingFamily && !family ? (
          <div className="mt-6 flex justify-center">
            <Spinner size={36} color={theme.primary} />
          </div>
        ) : family ? (
          <div className="w-full flex flex-col gap-3">
            {/* Demandes en attente */}
            {user.id === family.creatorId && family.joinRequests.length > 0 && (
              <div className="flex flex-col gap-3">
                {family.joinRequests.map(requestUser => (
                  <JoinRequestItem key={requestUser.id} requestUser={requestUser} familyId={family.id} />
                ))}
              </div>
            )}

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
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 65, height: 65, backgroundColor: theme.transparent }}
              >
                <img src={mascotteActivity} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
              </div>
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

            {/* Dernières activités de la Tribu */}
            {latestActivities.length > 0 && (
              <div className="flex flex-col" style={{ gap: 12, marginTop: 6 }}>
                <div className="flex items-center justify-between">
                  <span className="font-outfit-bold text-base" style={{ color: '#000000' }}>Dernières activités</span>
                  {/* Historique complet si plus de 3 activités */}
                  {completedActivities.length > latestActivities.length && (
                    <button
                      onClick={() => navigate('/historique?mode=family')}
                      className="font-outfit"
                      style={{ fontSize: 14, color: theme.primary, background: 'none', border: 'none', borderBottom: `1px solid ${theme.primary}`, padding: 0 }}
                    >
                      Voir plus →
                    </button>
                  )}
                </div>
                {latestActivities.map(fa => (
                  <ActivityCard
                    key={fa.id}
                    name={fa.activity.name}
                    description={fa.activity.description}
                    isPartner={fa.activity.isPartner}
                    category={fa.activity.category}
                    onPress={() => openActivityDetail(fa)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Carte illustration */}
            <div
              className="w-full bg-white flex flex-col items-center p-4 gap-3 mb-4"
              style={{ borderRadius: 24, boxShadow: '0px 4px 6px rgba(22, 22, 22, 0.04)' }}
            >
              <div className="w-full flex items-center justify-center" style={{ height: 160 }}>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 135, height: 135, backgroundColor: 'rgba(32, 193, 177, 0.1)' }}
                >
                  <img src={mascotte1} alt="" style={{ width: 115, height: 115, objectFit: 'contain' }} />
                </div>
              </div>
              <p className="font-outfit text-base text-center m-0" style={{ color: '#161616' }}>
                Commencez par rejoindre ou créer votre Tribu pour vivre des activités en famille
              </p>
            </div>

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

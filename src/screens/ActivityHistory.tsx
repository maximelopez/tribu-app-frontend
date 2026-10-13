import { useNavigate, useSearchParams } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useFamilyStore, toCatalogActivity } from '../store/familyStore';
import type { FamilyActivity } from '../store/familyStore';
import ActivityCard from '../components/ActivityCard';
import ScreenHeader from '../components/ScreenHeader';

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// Historique complet des activités terminées
// - ?mode=family (depuis le Home) : toutes les activités de la Tribu
// - ?mode=me (depuis le Profil) : celles auxquelles l'utilisateur a participé
export default function ActivityHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') === 'me' ? 'me' : 'family';

  const user = useUserStore(state => state.user);
  const completedActivities = useFamilyStore(state => state.completedActivities);

  const list = mode === 'me'
    ? completedActivities.filter(fa => fa.participants.some(p => p.id === user?.id))
    : completedActivities;

  const openActivityDetail = (familyActivity: FamilyActivity) => {
    const activity = toCatalogActivity(familyActivity);
    navigate(`/activites/${activity._id}`, { state: { activity } });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title={mode === 'me' ? 'Mes activités' : 'Activités de la Tribu'} />

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '8px 16px 24px', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
        <p className="font-outfit text-base m-0" style={{ color: '#161616', marginBottom: 12 }}>
          {list.length} activité{list.length > 1 ? 's' : ''} terminée{list.length > 1 ? 's' : ''}
        </p>

        {list.length === 0 ? (
          <p className="font-outfit text-base text-center" style={{ color: '#969696', marginTop: 24 }}>
            Aucune activité terminée pour l'instant
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 16 }}>
            {list.map(item => (
              <div key={item.id} className="flex flex-col" style={{ gap: 6 }}>
                <span className="font-outfit" style={{ fontSize: 14, color: '#969696' }}>{formatDate(item.completedAt)}</span>
                <ActivityCard
                  name={item.activity.name}
                  description={item.activity.description}
                  isPartner={item.activity.isPartner}
                  category={item.activity.category}
                  onPress={() => openActivityDetail(item)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

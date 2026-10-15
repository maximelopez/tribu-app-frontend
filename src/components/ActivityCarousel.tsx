import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import type { Activity } from '../store/familyStore';
import ActivityTile from './ActivityTile';

interface ActivityCarouselProps {
  title: string;
  activities: Activity[];
  onSeeAll: () => void;
  // Taille du titre : 20 (onglet Activités) ou 16 (Accueil)
  titleSize?: number;
}

// Section avec un titre, « Tout voir » et un carrousel de cartes d'activité (Figma : section + carrousel)
export default function ActivityCarousel({ title, activities, onSeeAll, titleSize = 20 }: ActivityCarouselProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <section className="flex flex-col" style={{ gap: 12 }}>
      <div className="flex items-center justify-between" style={{ padding: '0 16px', gap: 12 }}>
        <h2 className="font-outfit-bold font-normal m-0 truncate" style={{ fontSize: titleSize, color: '#161616' }}>{title}</h2>
        <button
          onClick={onSeeAll}
          className="font-outfit shrink-0 p-0"
          style={{ fontSize: 14, color: theme.primary, background: 'none', border: 'none' }}
        >
          Tout voir
        </button>
      </div>
      <div className="flex overflow-x-auto no-scrollbar" style={{ padding: '2px 16px 12px', gap: 12 }}>
        {activities.map(activity => (
          <ActivityTile
            key={activity._id}
            activity={activity}
            onPress={() => navigate(`/activites/${activity._id}`, { state: { activity } })}
          />
        ))}
      </div>
    </section>
  );
}

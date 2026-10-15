import { useTheme } from '../context/ThemeContext';
import { getActivityImage } from '../assets';
import type { Activity } from '../store/familyStore';
import { CATEGORY_LABELS } from '../categories';

const TEXT_DARK = '#161616';
const TEXT_GREY = '#6B6B6B';
const TAG_GREY = '#E3E3E3';

interface ActivityTileProps {
  activity: Activity;
  onPress: () => void;
  // Largeur fixe dans un carrousel, toute la largeur dans une liste
  fullWidth?: boolean;
}

// Carte d'activité en carrousel (Figma : carte-activite-klub) - Activités et Accueil
export default function ActivityTile({ activity, onPress, fullWidth = false }: ActivityTileProps) {
  const { theme } = useTheme();
  const image = getActivityImage(activity);
  const category = CATEGORY_LABELS[activity.category] ?? '';

  // « Nature · Gratuit » pour une activité libre, « Culture · Angers » pour une offre partenaire
  const subtitle = [category, activity.isPartner ? activity.city || 'Partenaire' : 'Gratuit'].filter(Boolean).join(' · ');

  return (
    <button
      onClick={onPress}
      className="flex flex-col items-start bg-white text-left shrink-0 active:opacity-85"
      style={{
        width: fullWidth ? '100%' : 280,
        padding: 12,
        gap: 12,
        borderRadius: 24,
        border: 'none',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Photo de l'activité, ou illustration de sa catégorie */}
      <div className="w-full overflow-hidden shrink-0" style={{ height: 150, borderRadius: 18, backgroundColor: theme.transparent }}>
        {image && <img src={image} alt="" className="w-full h-full block" style={{ objectFit: activity.imageUrl ? 'cover' : 'contain' }} />}
      </div>

      {/* Nom et catégorie */}
      <div className="flex flex-col w-full min-w-0" style={{ gap: 2 }}>
        <span className="font-outfit-bold text-base truncate" style={{ color: TEXT_DARK }}>{activity.name}</span>
        <span className="font-outfit truncate" style={{ fontSize: 14, color: TEXT_GREY }}>{subtitle}</span>
      </div>

      {/* Avantages : offre (ou activité gratuite) et points */}
      <div className="flex flex-wrap" style={{ gap: 6 }}>
        <span
          className="font-outfit rounded-full"
          style={{ fontSize: 14, padding: '2px 10px', backgroundColor: theme.transparent, color: theme.primary }}
        >
          {activity.isPartner ? activity.offer || 'Partenariat' : 'Activité gratuite'}
        </span>
        {activity.points !== undefined && (
          <span className="font-outfit rounded-full" style={{ fontSize: 14, padding: '2px 10px', backgroundColor: TAG_GREY, color: TEXT_DARK }}>
            +{activity.points} pts
          </span>
        )}
      </div>
    </button>
  );
}

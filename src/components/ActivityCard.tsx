import { Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getActivityImage } from '../assets';

const CARD_SHADOW = '0px 4px 6px rgba(0, 0, 0, 0.08)';

interface ActivityCardProps {
  name: string;
  description: string;
  isPartner: boolean;
  // Offre partenaire (ex : "1 partie offerte"), affichée à la place de "Partenariat"
  offer?: string | null;
  // Photo de l'activité, sinon l'illustration de sa catégorie (sinon une icône provisoire)
  imageUrl?: string | null;
  category?: string;
  // Points gagnés, affichés à côté du nom (ex : détail d'un badge)
  points?: number;
  onPress: () => void;
}

// Carte d'activité (Figma : Activities) - catalogue, Home, Profil et historique
export default function ActivityCard({ name, description, isPartner, offer, imageUrl, category, points, onPress }: ActivityCardProps) {
  const { theme } = useTheme();
  const illustration = getActivityImage({ imageUrl, category });

  return (
    <button
      onClick={onPress}
      className="w-full flex items-center bg-white text-left active:opacity-85"
      style={{ boxShadow: CARD_SHADOW, borderRadius: 20, minHeight: 101, padding: 20, gap: 16, border: 'none' }}
    >
      {/* Photo de l'activité ou illustration de sa catégorie (Figma : photo) */}
      {illustration ? (
        <img
          src={illustration}
          alt=""
          className="shrink-0"
          style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover' }}
        />
      ) : (
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: theme.transparent }}
        >
          <ImageIcon size={28} color={theme.primary} strokeWidth={2} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col items-start" style={{ gap: 2 }}>
        <div className="flex items-baseline w-full min-w-0" style={{ gap: 6 }}>
          <span className="font-outfit-bold text-base truncate" style={{ color: '#111111' }}>
            {name}
          </span>
          {points !== undefined && (
            <span className="font-outfit text-base shrink-0" style={{ color: theme.primary }}>+{points} pts</span>
          )}
        </div>
        {isPartner && (
          <span
            className="font-outfit text-sm rounded-full flex items-center"
            style={{ backgroundColor: theme.transparent, color: theme.primary, height: 21, padding: '0 6px' }}
          >
            {offer || 'Partenariat'}
          </span>
        )}
        <span className="font-outfit text-sm line-clamp-2" style={{ color: '#969696' }}>
          {description}
        </span>
      </div>

      <span
        className="flex items-center justify-center shrink-0 text-sm"
        style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#CBD5E0', color: '#111111' }}
      >
        →
      </span>
    </button>
  );
}

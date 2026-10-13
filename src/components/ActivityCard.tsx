import { Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CARD_SHADOW = '0px 4px 6px rgba(0, 0, 0, 0.08)';

interface ActivityCardProps {
  name: string;
  description: string;
  isPartner: boolean;
  onPress: () => void;
}

// Carte d'activité (Figma : Activities) — catalogue, Home, Profil et historique
export default function ActivityCard({ name, description, isPartner, onPress }: ActivityCardProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onPress}
      className="w-full flex items-center bg-white text-left active:opacity-85"
      style={{ boxShadow: CARD_SHADOW, borderRadius: 20, minHeight: 101, padding: 20, gap: 16, border: 'none' }}
    >
      {/* TODO : illustration selon la catégorie */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: theme.transparent }}
      >
        <ImageIcon size={28} color={theme.primary} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col items-start" style={{ gap: 2 }}>
        <span className="font-outfit-bold text-base w-full truncate" style={{ color: '#111111' }}>
          {name}
        </span>
        {isPartner && (
          <span
            className="font-outfit text-sm rounded-full flex items-center"
            style={{ backgroundColor: theme.transparent, color: theme.primary, height: 21, padding: '0 6px' }}
          >
            Partenariat
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

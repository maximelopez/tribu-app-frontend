import type { Badge } from '../hooks/useFamilyBadges';
import { Lock } from 'lucide-react';
import { getActivityIllustration, getBadgeImage } from '../assets';
import { formatUnlockedDate } from '../badges';

// Image du badge (assets/badges/<id>.svg). Pas encore obtenu : en gris.
// Si l'image manque, l'illustration de sa catégorie sert de secours.
export function BadgeIllustration({ badge, size }: { badge: Badge; size: number }) {
  const image = getBadgeImage(badge.id);
  const src = image ?? getActivityIllustration(badge.category);

  return (
    <img
      src={src ?? undefined}
      alt=""
      className="shrink-0 block"
      style={{
        width: size,
        height: size,
        borderRadius: image ? 0 : size * 0.22,
        objectFit: 'contain',
        filter: badge.unlocked ? 'none' : 'grayscale(1)',
        opacity: badge.unlocked ? 1 : 0.45,
      }}
    />
  );
}

interface BadgeCardProps {
  badge: Badge;
  onPress?: () => void;
}

// Carte d'un badge (Figma : badge). Obtenu : date d'obtention. Pas encore obtenu : grisé, cadenas et progression (ex : 1 / 3)
export default function BadgeCard({ badge, onPress }: BadgeCardProps) {
  const { unlocked } = badge;

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="w-full shrink-0 flex items-center text-left active:opacity-85"
      style={{
        padding: '14px 16px',
        gap: 14,
        borderRadius: 16,
        border: '1px solid #ECEFEE',
        backgroundColor: unlocked ? '#FFFFFF' : '#FAFBFA',
        boxShadow: unlocked ? '0px 4px 6px rgba(0, 0, 0, 0.06)' : 'none',
        cursor: onPress ? 'pointer' : 'default',
      }}
    >
      <BadgeIllustration badge={badge} size={56} />

      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 3 }}>
        <span className="font-outfit-bold text-base" style={{ lineHeight: 'normal', color: unlocked ? '#161616' : '#9AA19D' }}>
          {badge.name}
        </span>
        <span className="font-outfit" style={{ fontSize: 14, lineHeight: 'normal', color: unlocked ? '#6B746F' : '#9AA19D' }}>
          {badge.description}
        </span>
      </div>

      {unlocked ? (
        badge.unlockedAt && (
          <span className="font-outfit shrink-0" style={{ fontSize: 14, color: '#9AA19D' }}>
            Obtenu le {formatUnlockedDate(badge.unlockedAt)}
          </span>
        )
      ) : (
        <span className="font-outfit shrink-0 flex items-center" style={{ fontSize: 14, gap: 4, color: '#6B746F' }}>
          <Lock size={12} color="#6B746F" strokeWidth={2.5} />
          {badge.progress} / {badge.goal}
        </span>
      )}
    </button>
  );
}

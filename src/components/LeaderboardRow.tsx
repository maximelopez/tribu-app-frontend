import { useTheme } from '../context/ThemeContext';
import { getAvatar } from '../assets';
import type { Member } from '../store/familyStore';

const TEXT_DARK = '#111111';
const TEXT_GREY = '#969696';
const BORDER = '#F5F5F3';

export interface RankedMember extends Member {
  activitiesTotal: number;
  isCurrentUser: boolean;
}

interface Props {
  rank: number;
  member: RankedMember;
  isLast: boolean;
}

export default function LeaderboardRow({ rank, member, isLast }: Props) {
  const { theme } = useTheme();

  // Le podium (1 à 3) prend la couleur du thème, les suivants en gris
  const rankColor = rank <= 3 ? theme.primary : TEXT_GREY;

  return (
    <div
      className="flex items-center"
      style={{
        gap: 12,
        padding: '11px 18px',
        borderBottom: isLast ? 'none' : `1px solid ${BORDER}`,
      }}
    >
      <span className="font-outfit text-base text-center" style={{ width: 20, color: rankColor }}>
        {rank}
      </span>

      <img
        src={getAvatar(member.avatar)}
        alt=""
        style={{ width: 36, height: 36, borderRadius: 18, border: '3px solid #FFFFFF', objectFit: 'cover' }}
      />

      <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 1 }}>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span className="font-outfit text-base truncate" style={{ color: TEXT_DARK }}>{member.name}</span>
          {member.isCurrentUser && (
            <span
              className="font-outfit text-sm rounded-full"
              style={{ backgroundColor: theme.transparent, color: theme.primary, padding: '1px 7px' }}
            >
              Moi
            </span>
          )}
        </div>
        <span className="font-outfit text-sm" style={{ color: TEXT_GREY }}>
          {member.activitiesTotal} activité{member.activitiesTotal > 1 ? 's' : ''}
        </span>
      </div>

      <span className="font-outfit text-sm text-right" style={{ color: TEXT_GREY }}>
        {member.points} pts
      </span>
    </div>
  );
}

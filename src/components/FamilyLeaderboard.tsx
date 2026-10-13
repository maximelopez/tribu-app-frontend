import { useTheme } from '../context/ThemeContext';
import type { LevelInfo, Member } from '../store/familyStore';
import LeaderboardRow from './LeaderboardRow';

interface FamilyLeaderboardProps {
  familyName: string;
  members: Member[];
  currentUserId: string;
  levelInfo: LevelInfo;
  // Nombre d'activités terminées par membre (id -> total)
  activityCounts?: Record<string, number>;
}

export default function FamilyLeaderboard({
  familyName,
  members,
  currentUserId,
  levelInfo,
  activityCounts = {},
}: FamilyLeaderboardProps) {
  const { theme } = useTheme();

  // Associe chaque membre à son nombre d'activités terminées, puis classe par points
  const rankedMembers = members
    .map((member) => ({
      ...member,
      activitiesTotal: activityCounts[member.id] ?? 0,
      isCurrentUser: member.id === currentUserId,
    }))
    .sort((a, b) => b.points - a.points);

  const progressPercent = Math.round(levelInfo.progress * 100);

  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' }}>
      {/* Header coloré : nom, membres, niveau */}
      <div style={{ backgroundColor: theme.primary }}>
        <div className="flex flex-col" style={{ padding: '16px 18px 14px', gap: 1 }}>
          <span className="text-white font-outfit-bold text-base">{familyName}</span>
          <span className="text-white font-outfit text-sm">
            {members.length} membre{members.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-col" style={{ padding: '12px 18px 14px', gap: 6 }}>
          <div className="flex items-center justify-between">
            <span className="text-white font-outfit-bold text-base">Niveau {levelInfo.level}</span>
            <span className="text-white font-outfit text-base">
              {levelInfo.isMax
                ? 'Niveau maximum'
                : `${levelInfo.remaining} pts → Niveau ${levelInfo.level + 1}`}
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div className="rounded-full bg-white" style={{ height: 6, width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Classement des membres */}
      <div style={{ padding: '4px 0' }}>
        {rankedMembers.map((member, index) => (
          <LeaderboardRow
            key={member.id}
            rank={index + 1}
            member={member}
            isLast={index === rankedMembers.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

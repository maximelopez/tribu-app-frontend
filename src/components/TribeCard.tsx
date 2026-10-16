import { useTheme } from '../context/ThemeContext';
import { getAvatar } from '../assets';
import type { Family, FamilyActivity } from '../store/familyStore';
import { WEEKLY_GOAL, countThisWeek, weeklyGoalText } from '../weeklyGoal';

const TEXT_DARK = '#161616';
const TEXT_GREY = '#5F5F5F';
const TRACK = '#F3F3F8';

interface TribeCardProps {
  family: Family;
  currentUserId: string;
  completedActivities: FamilyActivity[];
}

// Carte de la Tribu sur l'Accueil : niveau, points, objectif de la semaine, membres (Figma : carte-tribu)
export default function TribeCard({ family, currentUserId, completedActivities }: TribeCardProps) {
  const { theme } = useTheme();
  const { levelInfo } = family;
  const members = family.members ?? [];

  // Nombre d'activités terminées par membre
  const counts: Record<string, number> = {};
  completedActivities.forEach(fa => fa.participants.forEach(p => { counts[p.id] = (counts[p.id] ?? 0) + 1; }));
  const ranked = [...members].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0) || b.points - a.points);

  const doneThisWeek = Math.min(countThisWeek(completedActivities), WEEKLY_GOAL);
  const nextLevelPoints = family.points + levelInfo.remaining;

  return (
    <div className="bg-white flex flex-col" style={{ padding: 20, gap: 18, borderRadius: 24, boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.06)' }}>
      {/* Nom, membres, ville et niveau */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <div className="flex-1 min-w-0 flex flex-col" style={{ gap: 2 }}>
          <span className="font-outfit-bold truncate" style={{ fontSize: 24, color: TEXT_DARK }}>{family.name}</span>
          <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>
            {members.length} membre{members.length > 1 ? 's' : ''}{family.city ? ` · ${family.city}` : ''}
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center shrink-0"
          style={{ width: 68, height: 68, borderRadius: 20, backgroundColor: theme.transparent, color: TEXT_DARK }}
        >
          <span className="font-outfit-bold" style={{ fontSize: 12, letterSpacing: 0.24 }}>Niveau</span>
          <span className="font-outfit-bold" style={{ fontSize: 26, lineHeight: 1 }}>{levelInfo.level}</span>
        </div>
      </div>

      {/* Progression vers le niveau suivant */}
      <div className="flex flex-col" style={{ gap: 8 }}>
        <div className="overflow-hidden" style={{ height: 10, borderRadius: 999, backgroundColor: TRACK }}>
          <div className="progress-fill" style={{ width: `${Math.round(levelInfo.progress * 100)}%`, height: '100%', borderRadius: 999, backgroundColor: theme.primary }} />
        </div>
        <div className="flex justify-between font-outfit" style={{ fontSize: 14 }}>
          {levelInfo.isMax ? (
            <span style={{ color: TEXT_DARK }}>{family.points} pts · Niveau maximum</span>
          ) : (
            <>
              <span style={{ color: TEXT_DARK, fontWeight: 500 }}>{family.points} / {nextLevelPoints} pts</span>
              <span style={{ color: TEXT_GREY }}>{levelInfo.remaining} pts avant le niveau {levelInfo.level + 1}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#EEEEF2' }} />

      {/* Objectif de la semaine */}
      <div className="flex flex-col" style={{ gap: 10 }}>
        <div className="flex items-center justify-between">
          <span className="font-outfit-bold" style={{ fontSize: 16, color: TEXT_DARK }}>Objectif de la semaine</span>
          <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY, fontWeight: 500 }}>
            {doneThisWeek} / {WEEKLY_GOAL} activités
          </span>
        </div>
        <div className="flex" style={{ gap: 6 }} aria-hidden="true">
          {Array.from({ length: WEEKLY_GOAL }, (_, i) => (
            <span key={i} className="flex-1" style={{ height: 10, borderRadius: 999, backgroundColor: i < doneThisWeek ? theme.primary : TRACK }} />
          ))}
        </div>
        <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>{weeklyGoalText(doneThisWeek)}</span>
      </div>

      {/* Membres, du plus actif au moins actif */}
      <div
        className="flex overflow-x-auto no-scrollbar"
        style={{ gap: 12, justifyContent: ranked.length <= 5 ? 'space-between' : 'flex-start' }}
      >
        {ranked.map(member => {
          const isMe = member.id === currentUserId;
          const total = counts[member.id] ?? 0;
          return (
            <div key={member.id} className="flex flex-col items-center shrink-0" style={{ gap: 4, minWidth: 56, maxWidth: 64 }}>
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 56, height: 56, border: isMe ? `2.5px solid ${theme.primary}` : 'none' }}
              >
                <img
                  src={getAvatar(member.avatar)}
                  alt=""
                  className="rounded-full"
                  style={{ width: isMe ? 50 : 56, height: isMe ? 50 : 56, border: '3px solid #FFFFFF', objectFit: 'cover' }}
                />
              </span>
              <span
                className={`${isMe ? 'font-outfit-bold' : 'font-outfit'} w-full text-center overflow-hidden text-ellipsis whitespace-nowrap`}
                style={{ fontSize: 14, color: TEXT_DARK }}
              >
                {isMe ? 'Moi' : member.name}
              </span>
              <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>{total} act.</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

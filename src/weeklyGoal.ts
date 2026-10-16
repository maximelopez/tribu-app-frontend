import type { FamilyActivity } from './store/familyStore';

// Objectif de la semaine : nombre d'activités à terminer en famille chaque semaine
export const WEEKLY_GOAL = 4;

// Lundi de la semaine en cours, à minuit (heure du téléphone)
export const startOfWeek = (now = new Date()) => {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
};

// Activités terminées depuis lundi
export const countThisWeek = (activities: FamilyActivity[], now = new Date()) => {
  const monday = startOfWeek(now).getTime();
  return activities.filter(fa => fa.completedAt && new Date(fa.completedAt).getTime() >= monday).length;
};

// Phrase sous les segments (ex : « Plus qu'une activité pour boucler la semaine ! »)
export const weeklyGoalText = (done: number) => {
  const left = WEEKLY_GOAL - done;
  if (left <= 0) return 'Objectif atteint, bravo à toute la Tribu !';
  if (left === 1) return "Plus qu'une activité pour boucler la semaine !";
  return `Encore ${left} activités pour boucler la semaine !`;
};

import { describe, expect, it } from 'vitest';
import { countThisWeek, startOfWeek, weeklyGoalText } from '../../src/weeklyGoal';
import type { FamilyActivity } from '../../src/store/familyStore';

const done = (completedAt: string | null) => ({ completedAt }) as FamilyActivity;

describe('Objectif de la semaine', () => {
  it('commence la semaine le lundi à minuit', () => {
    const monday = startOfWeek(new Date(2026, 9, 15, 18, 30)); // jeudi 15 octobre
    expect([monday.getDate(), monday.getDay(), monday.getHours()]).toEqual([12, 1, 0]);
    expect(startOfWeek(new Date(2026, 9, 18, 23, 0)).getDate()).toBe(12); // dimanche : même semaine
    expect(startOfWeek(new Date(2026, 9, 19, 0, 1)).getDate()).toBe(19); // lundi suivant : nouvelle semaine
  });

  it('ne compte que les activités terminées depuis lundi', () => {
    const now = new Date(2026, 9, 15, 12, 0);
    const list = [
      done(new Date(2026, 9, 12, 9, 0).toISOString()), // lundi
      done(new Date(2026, 9, 14, 20, 0).toISOString()), // mercredi
      done(new Date(2026, 9, 11, 22, 0).toISOString()), // dimanche d'avant
      done(null),
    ];
    expect(countThisWeek(list, now)).toBe(2);
  });

  it('adapte la phrase au nombre d\'activités restantes', () => {
    expect(weeklyGoalText(0)).toBe('Encore 4 activités pour boucler la semaine !');
    expect(weeklyGoalText(3)).toBe("Plus qu'une activité pour boucler la semaine !");
    expect(weeklyGoalText(4)).toBe('Objectif atteint, bravo à toute la Tribu !');
  });
});

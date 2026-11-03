import { describe, expect, it } from 'vitest';
import { durationText, participantsText } from '../../src/activityText';

describe("Textes du détail d'une activité", () => {
  it('durée en heures et minutes', () => {
    expect(durationText(45)).toBe('Environ 45 min');
    expect(durationText(120)).toBe('Environ 2 h');
    expect(durationText(90)).toBe('Environ 1 h 30');
  });

  it('nombre de participants', () => {
    expect(participantsText(2)).toBe('Dès 2 membres de la Tribu');
    expect(participantsText(1, 6)).toBe("Jusqu'à 6 personnes");
    expect(participantsText(2, 6)).toBe('De 2 à 6 personnes');
    expect(participantsText(4, 4)).toBe('4 personnes');
    expect(participantsText(1, null)).toBeNull();
  });
});

// Textes du détail d'une activité (durée, nombre de participants)

// Durée en texte : 90 → "Environ 1 h 30", 120 → "Environ 2 h", 45 → "Environ 45 min"
export const durationText = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `Environ ${rest} min`;
  return `Environ ${hours} h${rest ? ` ${rest}` : ''}`;
};

// Nombre de participants en texte : "Dès 2 membres de la Tribu", "Jusqu'à 6 personnes", "De 2 à 6 personnes"
export const participantsText = (min = 1, max?: number | null) => {
  if (max && min > 1) return min === max ? `${min} personnes` : `De ${min} à ${max} personnes`;
  if (max) return `Jusqu'à ${max} personnes`;
  if (min > 1) return `Dès ${min} membres de la Tribu`;
  return null;
};

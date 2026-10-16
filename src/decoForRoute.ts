import type { DecoVariant } from './components/DecoBackground';

// Courbe décorative de chaque écran, comme sur la maquette (null : pas de courbe)
export const decoForRoute = (
  pathname: string,
  hasFamily: boolean,
  hasOngoingActivity: boolean
): { variant: DecoVariant; flipped: boolean } | null => {
  const main = (flipped = false) => ({ variant: 'main' as const, flipped });
  const empty = { variant: 'empty' as const, flipped: false };

  if (pathname === '/connexion') return main();
  if (pathname === '/inscription') return main(true);
  if (pathname === '/') return hasFamily ? main(hasOngoingActivity) : empty;
  if (pathname === '/recompenses') return hasFamily ? main() : empty;
  if (pathname === '/recompenses/badges') return empty;
  if (pathname.startsWith('/recompenses/badges/')) return main(true);
  if (pathname === '/activites') return main(true);
  if (pathname === '/chat') return hasFamily ? main(true) : empty;
  if (pathname === '/profil' || pathname === '/historique') return main();
  if (pathname === '/tribu/rechercher') return empty;
  if (pathname === '/tribu/creer') return main(true);
  if (pathname.startsWith('/tribu/')) return main();
  // Onboarding (fond vert à motifs), détail d'une activité (photo), récompense, pages légales
  return null;
};

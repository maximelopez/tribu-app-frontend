import type { DecoVariant } from './components/DecoBackground';

export interface ScreenDeco {
  variant: DecoVariant;
  mirrored: boolean;
}

// Courbe décorative de chaque écran, relevée sur la maquette Figma (null : pas de courbe)
// - main : déco/mèche-tribu (grande courbe)
// - empty : déco/mèche-tribu (empty state) (deux petites courbes, écrans vides)
export const decoForRoute = (
  pathname: string,
  hasFamily: boolean,
  hasOngoingActivity: boolean
): ScreenDeco | null => {
  const main = (mirrored = false) => ({ variant: 'main' as const, mirrored });
  const empty = (mirrored = false) => ({ variant: 'empty' as const, mirrored });

  if (pathname === '/connexion' || pathname === '/inscription') return empty(true);
  if (pathname === '/') return hasFamily ? main(hasOngoingActivity) : empty();
  if (pathname === '/recompenses') return hasFamily ? main() : empty();
  if (pathname === '/recompenses/badges') return empty();
  if (pathname.startsWith('/recompenses/badges/')) return main(true);
  if (pathname === '/activites') return main(true);
  if (pathname === '/chat') return hasFamily ? main(true) : empty();
  if (pathname === '/profil' || pathname === '/historique') return main();
  if (pathname === '/tribu/rechercher') return empty();
  if (pathname === '/tribu/creer') return main();
  if (pathname.startsWith('/tribu/')) return main();
  // Onboarding (fond de couleur à motifs), détail d'une activité (photo), récompense, pages légales
  return null;
};

// Fond de l'écran (Figma : White-background, et Neutral-elements pour la connexion et le chat)
export const backgroundForRoute = (pathname: string) =>
  pathname === '/connexion' || pathname === '/chat' ? '#F7F5F8' : '#F3F3F8';

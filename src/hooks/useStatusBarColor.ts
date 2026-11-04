import { useEffect } from 'react';

// Couleur par défaut de la barre du téléphone (même valeur que dans index.html)
const DEFAULT_COLOR = '#F3F3F8';

// Change la couleur de la barre d'état du téléphone (en haut) pendant que l'écran est affiché.
// Évite l'effet « bandeau » quand le haut de l'écran n'a pas la couleur par défaut.
export default function useStatusBarColor(color: string | null) {
  useEffect(() => {
    if (!color) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute('content', color);
    // En quittant l'écran : retour à la couleur par défaut
    return () => meta.setAttribute('content', DEFAULT_COLOR);
  }, [color]);
}

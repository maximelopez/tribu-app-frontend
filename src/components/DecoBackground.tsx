import { useTheme } from '../context/ThemeContext';

export type DecoVariant = 'main' | 'empty';

interface DecoBackgroundProps {
  variant: DecoVariant;
  // true : la courbe est retournée comme dans un miroir (gauche ↔ droite), comme sur certains écrans de la maquette
  mirrored?: boolean;
}

// Courbes décoratives derrière le contenu : couleur vive de la charte à 10 % (Transparent du thème).
// Mêmes tracés que les composants Figma « déco/mèche-tribu » (main) et « déco/mèche-tribu (empty state) » (empty)
export default function DecoBackground({ variant, mirrored = false }: DecoBackgroundProps) {
  const { theme } = useTheme();
  const stroke = { stroke: theme.transparent, strokeWidth: 26, fill: 'none' };
  const rounded = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox="0 0 393 852"
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
    >
      {variant === 'main' ? (
        <path d="M440 120C300 70 110 140 105 290C100 430 270 470 240 395C215 335 115 365 125 455C140 570 320 610 450 720" {...stroke} />
      ) : (
        <>
          <path d="M450 60.85C330 50.85 270 130.85 300 200.85C320 245.85 380 252.85 450 222.85" {...stroke} {...rounded} />
          <path d="M-60 690C40 650 125 690 105 738C90 772 40 748 55 716C75 680 165 700 210 870" {...stroke} {...rounded} />
        </>
      )}
    </svg>
  );
}

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

const PIECES = 28;
const LIFETIME = 3200; // ms avant de retirer les confettis

interface ConfettiProps {
  colors: string[];
}

// Pluie de confettis qui tombe une fois sur tout l'écran (écran Récompense).
// Masquée si "Réduire les animations" (voir index.css).
export default function Confetti({ colors }: ConfettiProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), LIFETIME);
    return () => clearTimeout(timer);
  }, []);

  // Position, taille, forme et trajectoire tirées au hasard une seule fois
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => {
        const size = 6 + Math.random() * 5;
        return {
          left: `${Math.random() * 100}%`,
          width: size,
          height: Math.random() < 0.5 ? size : size * 1.8,
          borderRadius: Math.random() < 0.35 ? '50%' : 2,
          backgroundColor: colors[i % colors.length],
          '--delay': `${Math.random() * 0.4}s`,
          '--dur': `${1.6 + Math.random() * 1}s`,
          '--drift': `${Math.round(Math.random() * 80 - 40)}px`,
          '--spin': `${Math.round(200 + Math.random() * 520)}deg`,
        } as CSSProperties;
      }),
    [colors]
  );

  if (!visible) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 40 }} aria-hidden="true">
      {pieces.map((style, i) => (
        <span key={i} className="confetti-piece" style={style} />
      ))}
    </div>
  );
}

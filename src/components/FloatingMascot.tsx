import type { CSSProperties } from 'react';

// Dimensions des 2 tailles de la maquette (position Haut, puis ce qui change en position Bas)
const SIZES = {
  grande: { circle: 135, mascot: 115, mascotTop: 5.5, drop: 6, shadowTop: 116, shadowWidth: 46, shadowWidthDown: 59, shadowHeight: 7 },
  petite: { circle: 65, mascot: 55, mascotTop: 2.75, drop: 3, shadowTop: 56, shadowWidth: 22, shadowWidthDown: 29, shadowHeight: 3 },
};

interface FloatingMascotProps {
  image: string;
  circleColor: string;               // fond du rond derrière la mascotte
  size?: keyof typeof SIZES;
  style?: CSSProperties;
}

// Mascotte qui flotte dans son rond, avec son ombre (Figma : mascotte-flottante).
// La mascotte descend et son ombre s'élargit, en boucle (animation dans index.css).
export default function FloatingMascot({ image, circleColor, size = 'grande', style }: FloatingMascotProps) {
  const s = SIZES[size];

  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{
        width: s.circle,
        height: s.circle,
        backgroundColor: circleColor,
        '--mascot-drop': `${s.drop}px`,
        '--shadow-scale': s.shadowWidthDown / s.shadowWidth,
        ...style,
      } as CSSProperties}
    >
      <span
        className="floating-mascot-shadow absolute rounded-full"
        style={{
          top: s.shadowTop,
          left: (s.circle - s.shadowWidth) / 2,
          width: s.shadowWidth,
          height: s.shadowHeight,
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
        }}
      />
      <img
        src={image}
        alt=""
        className="floating-mascot absolute"
        style={{ top: s.mascotTop, left: (s.circle - s.mascot) / 2, width: s.mascot, height: s.mascot, objectFit: 'contain' }}
      />
    </div>
  );
}

interface SpinnerProps {
  size?: number;
  color?: string;
  trackColor?: string;
  stroke?: number;
}

// Petit spinner (équivalent d'ActivityIndicator)
export default function Spinner({ size = 24, color = '#FFFFFF', trackColor = 'transparent', stroke = 3 }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Chargement"
      className="tribu-spin inline-block rounded-full"
      style={{
        width: size,
        height: size,
        borderWidth: stroke,
        borderStyle: 'solid',
        borderColor: trackColor,
        borderTopColor: color,
        borderRightColor: trackColor === 'transparent' ? color : trackColor,
      }}
    />
  );
}

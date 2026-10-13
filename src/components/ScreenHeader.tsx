import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ScreenHeaderProps {
  title?: string;
  // false : pas de flèche retour (ex : écran récompense)
  showBack?: boolean;
  titleFont?: 'bold' | 'regular';
  backgroundColor?: string;
}

// En-tête des écrans "empilés" (équivalent du header natif de mobile)
export default function ScreenHeader({
  title = '',
  showBack = true,
  titleFont = 'bold',
  backgroundColor = '#F3F3F8',
}: ScreenHeaderProps) {
  const navigate = useNavigate();

  // Retour : page précédente si elle existe, sinon l'accueil
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <header
      className="relative flex items-center justify-center shrink-0"
      style={{ minHeight: 60, paddingTop: 'env(safe-area-inset-top)', backgroundColor }}
    >
      {showBack && (
        // Bouton retour rond (Figma : "retour")
        <button
          onClick={goBack}
          aria-label="Retour"
          className="absolute flex items-center justify-center bg-white active:opacity-80"
          style={{
            left: 16,
            bottom: 8,
            width: 44,
            height: 44,
            borderRadius: 22,
            border: 'none',
            boxShadow: '0px 2px 4px rgba(13, 23, 18, 0.1)',
          }}
        >
          <ChevronLeft size={24} color="#161616" strokeWidth={2} />
        </button>
      )}
      {title ? (
        <h1
          className={titleFont === 'bold' ? 'font-outfit-bold' : 'font-outfit'}
          style={{ fontSize: 20, color: '#161616', margin: 0, fontWeight: 'normal' }}
        >
          {title}
        </h1>
      ) : null}
    </header>
  );
}

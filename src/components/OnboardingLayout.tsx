import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { logoTribu } from '../assets';

interface OnboardingLayoutProps {
  background: string;      // image de fond à motifs
  backgroundColor: string; // couleur du thème (sous l'image)
  showBack?: boolean;
  children: ReactNode;
}

// Fond à motifs + logo + "Avant de commencer ..." (écrans date, couleur, avatar)
export default function OnboardingLayout({ background, backgroundColor, showBack = false, children }: OnboardingLayoutProps) {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 overflow-y-auto no-scrollbar relative"
      style={{
        backgroundColor,
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '22px 16px 24px',
        paddingTop: 'calc(22px + env(safe-area-inset-top))',
      }}
    >
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="absolute flex items-center justify-center bg-white active:opacity-80"
          style={{
            top: 'calc(16px + env(safe-area-inset-top))',
            left: 16,
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

      <img src={logoTribu} alt="Tribu" className="block mx-auto" style={{ width: 179, height: 179 }} />
      <h1 className="font-peachy text-white text-center font-normal m-0" style={{ fontSize: 32 }}>
        Avant de commencer ...
      </h1>

      {children}
    </div>
  );
}

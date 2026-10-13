import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { backgroundMap } from '../assets';
import Spinner from '../components/Spinner';

export default function LoadingScreen() {
  const { theme, themeColor } = useTheme();
  const setOnboardingCompleted = useUserStore(state => state.setOnboardingCompleted);

  // Après 2 secondes : l'app s'ouvre (le routeur bascule sur l'accueil)
  useEffect(() => {
    const timer = setTimeout(() => setOnboardingCompleted(true), 2000);
    return () => clearTimeout(timer);
  }, [setOnboardingCompleted]);

  return (
    <div
      className="flex-1 flex flex-col justify-center items-center"
      style={{
        backgroundColor: theme.primary,
        backgroundImage: `url(${backgroundMap[themeColor]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 29px',
        gap: 61,
      }}
    >
      <h1 className="font-peachy text-white text-center font-normal m-0" style={{ fontSize: 32 }}>
        Parfait ! On prépare ton profil…
      </h1>

      {/* Spinner (Figma : Spinner-Gradient) : anneau gris clair + arc blanc */}
      <Spinner size={48} stroke={8} color="#FFFFFF" trackColor="#D9D9D9" />
    </div>
  );
}

import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { mascotteNoResults } from '../assets';
import Button from './Button';
import FloatingMascot from './FloatingMascot';

interface NoFamilyStateProps {
  title: string;            // titre de l'écran, lu par les lecteurs d'écran (ex : « Chat »)
  message: string;
  image?: string;           // mascotte (par défaut : celle du chat)
  circleColor?: string;     // fond du rond derrière la mascotte
}

// État vide quand l'utilisateur n'a pas encore de Tribu (Figma : chat-empty-state, recompense-empty-state)
export default function NoFamilyState({
  title,
  message,
  image = mascotteNoResults,
  circleColor = 'rgba(234, 74, 31, 0.1)',
}: NoFamilyStateProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col justify-center items-center" style={{ padding: '0 28px', gap: 20 }}>
      {/* Titre invisible à l'écran (la maquette n'en a pas), mais annoncé par les lecteurs d'écran */}
      <h1 className="sr-only">{title}</h1>
      <FloatingMascot image={image} circleColor={circleColor} />
      <p className="font-outfit text-base text-center m-0" style={{ color: '#111111' }}>{message}</p>
      <div className="w-full">
        <Button
          title="Trouver ma Tribu"
          onPress={() => navigate('/tribu/rechercher')}
          color={theme.primary}
          icon={<Search size={20} color="#FFFFFF" strokeWidth={2} />}
          iconPosition="left"
        />
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { mascotteNoResults } from '../assets';
import Button from './Button';
import FloatingMascot from './FloatingMascot';

interface NoFamilyStateProps {
  message: string;
  image?: string;           // mascotte (par défaut : celle du chat)
  circleColor?: string;     // fond du rond derrière la mascotte
}

// État vide quand l'utilisateur n'a pas encore de Tribu (Figma : chat-empty-state, recompense-empty-state)
export default function NoFamilyState({
  message,
  image = mascotteNoResults,
  circleColor = 'rgba(234, 74, 31, 0.1)',
}: NoFamilyStateProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col justify-center items-center" style={{ padding: '0 28px', gap: 20 }}>
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

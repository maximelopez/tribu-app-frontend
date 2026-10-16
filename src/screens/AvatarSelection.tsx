import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { AVATARS, backgroundMap, getAvatar } from '../assets';
import Button from '../components/Button';
import { ChevronRight } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';

// Ronds d'avatar (Figma : mascotte1..4)
const AVATAR_SIZE = 64;

export default function AvatarSelection() {
  const { theme, themeColor } = useTheme();
  const user = useUserStore(state => state.user);
  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(user?.avatar ?? null);

  // Avatar gardé dans l'app : envoyé au serveur seulement après l'accord (écran consentement)
  const changeAvatar = (avatar: number) => {
    setSelectedAvatar(avatar);
    if (!user?.id) return;
    useUserStore.getState().setUser(prev => prev ? { ...prev, avatar } : prev);
  };

  return (
    <OnboardingLayout background={backgroundMap[themeColor]} backgroundColor={theme.primary} showBack>
      {/* Choix de l'avatar */}
      <div className="flex flex-col" style={{ marginTop: 82, gap: 26 }}>
        <span className="font-outfit text-base text-white">Choisissez votre avatar :</span>

        <div className="flex justify-center" style={{ gap: 20 }}>
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar;
            return (
              <button
                key={avatar}
                onClick={() => changeAvatar(avatar)}
                aria-label={`Avatar ${avatar}`}
                aria-pressed={isSelected}
                className="overflow-hidden p-0"
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                  borderRadius: AVATAR_SIZE / 2,
                  // Non sélectionné : bordure blanche. Sélectionné : anneau blanc semi-transparent (Figma)
                  border: isSelected ? 'none' : '3px solid #FFFFFF',
                  outline: isSelected ? '5px solid rgba(255, 255, 255, 0.5)' : 'none',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.09)',
                  background: '#FFFFFF',
                }}
              >
                <img src={getAvatar(avatar)} alt="" className="w-full h-full block" style={{ objectFit: 'cover' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Suivant (actif une fois un avatar choisi) */}
      <div style={{ marginTop: 91 }}>
        <Button
          title="Suivant"
          onPress={() => navigate('/bienvenue/consentement')}
          disabled={!selectedAvatar}
          color="#FFFFFF"
          textColor={theme.primary}
          icon={<ChevronRight size={20} color={theme.primary} strokeWidth={2.5} />}
        />
      </div>
    </OnboardingLayout>
  );
}

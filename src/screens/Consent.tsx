import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronLeft, ClipboardList, Info, ShieldCheck, SlidersHorizontal, Target } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserStore } from '../store/userStore';
import { backgroundMap } from '../assets';
import Button from '../components/Button';
import LegalOverlay from '../components/LegalOverlay';
import { PRIVACY_POLICY, TERMS } from '../legal';
import type { LegalText } from '../legal';
import { api } from '../api';

const TEXT_DARK = '#161616';
const TEXT_GREY = '#5A635F';

// Ce que l'app fait des données (Figma : consentement > carte)
const INFOS: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <ClipboardList size={18} strokeWidth={2} />,
    title: 'Ce qu’on collecte',
    text: 'Ton prénom, ton email, ta date de naissance, ton avatar et ta couleur. Pas de photo, pas de localisation.',
  },
  {
    icon: <Target size={18} strokeWidth={2} />,
    title: 'Pourquoi',
    text: 'Pour créer ton profil, faire vivre ta Tribu et la faire progresser.',
  },
  {
    icon: <ShieldCheck size={18} strokeWidth={2} />,
    title: 'Ce qu’on ne fera jamais',
    text: 'Vendre tes données ou les utiliser pour de la publicité.',
  },
  {
    icon: <SlidersHorizontal size={18} strokeWidth={2} />,
    title: 'Tu gardes le contrôle',
    text: 'Tu peux modifier ton profil à tout moment, et demander la suppression de ton compte depuis ton profil.',
  },
];

// Dernier écran de l'onboarding : accord aux CGU et à la politique de confidentialité.
// Les choix de l'onboarding (date, couleur, avatar) sont envoyés au serveur seulement ici, avec l'accord
export default function Consent() {
  const navigate = useNavigate();
  const { theme, themeColor } = useTheme();
  const user = useUserStore(state => state.user);

  const [accepted, setAccepted] = useState(false);
  const [legalText, setLegalText] = useState<LegalText | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAccept = async () => {
    if (!user || !accepted || loading) return;

    // Étape oubliée (ex : page rechargée) : on la refait
    if (!user.birthdate) return navigate('/bienvenue/naissance');
    if (!user.avatar) return navigate('/bienvenue/avatar');

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await api(`users/${user.id}/onboarding`, {
        method: 'PATCH',
        body: { acceptTerms: true, birthdate: user.birthdate, theme: themeColor, avatar: user.avatar },
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      useUserStore.getState().setUser(prev => prev ? {
        ...prev,
        birthdate: data.birthdate,
        theme: data.theme,
        avatar: data.avatar,
        acceptedTermsAt: data.acceptedTermsAt,
      } : prev);
      navigate('/bienvenue/chargement');
    } catch (error) {
      console.error('Erreur consentement :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const linkStyle = { fontSize: 14, color: theme.primary, background: 'none', border: 'none', padding: 0 };

  return (
    <div className="flex-1 min-h-0 flex flex-col relative">
      <div
        className="flex-1 overflow-y-auto no-scrollbar flex flex-col"
        style={{
          backgroundColor: theme.primary,
          backgroundImage: `url(${backgroundMap[themeColor]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '16px 16px 24px',
          paddingTop: 'calc(16px + env(safe-area-inset-top))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
        }}
      >
        {/* Retour vers l'avatar */}
        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="flex items-center justify-center bg-white shrink-0 active:opacity-80"
          style={{ width: 44, height: 44, borderRadius: 22, border: 'none', boxShadow: '0px 2px 4px rgba(13, 23, 18, 0.1)' }}
        >
          <ChevronLeft size={24} color={TEXT_DARK} strokeWidth={2} />
        </button>

        <div className="flex flex-col" style={{ marginTop: 16, gap: 20 }}>
          {/* Titre */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            <h1 className="font-outfit-bold font-normal text-white m-0" style={{ fontSize: 32, lineHeight: 'normal' }}>
              Ta vie privée, on y tient
            </h1>
            <p className="font-outfit text-base m-0" style={{ color: 'rgba(255, 255, 255, 0.92)' }}>
              Avant de créer ton profil, voici simplement comment on utilise tes données.
            </p>
          </div>

          {/* Carte : ce qu'on fait des données + case d'accord */}
          <div className="bg-white flex flex-col" style={{ padding: 20, gap: 16, borderRadius: 24 }}>
            {INFOS.map(info => (
              <div key={info.title} className="flex items-start" style={{ gap: 12 }}>
                <span
                  className="flex items-center justify-center shrink-0"
                  style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.transparent, color: theme.primary }}
                >
                  {info.icon}
                </span>
                <div className="flex flex-col min-w-0" style={{ gap: 2 }}>
                  <span className="font-outfit-bold text-base" style={{ color: TEXT_DARK }}>{info.title}</span>
                  <span className="font-outfit" style={{ fontSize: 14, color: TEXT_GREY }}>{info.text}</span>
                </div>
              </div>
            ))}

            <div style={{ height: 1, backgroundColor: '#D9E0DE' }} />

            <div className="flex items-start" style={{ gap: 12 }}>
              <button
                type="button"
                role="checkbox"
                aria-checked={accepted}
                aria-label="J'accepte les conditions d'utilisation et la politique de confidentialité"
                onClick={() => setAccepted(value => !value)}
                className="flex items-center justify-center shrink-0 p-0"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  border: `2px solid ${theme.primary}`,
                  backgroundColor: accepted ? theme.primary : '#FFFFFF',
                }}
              >
                {accepted && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
              </button>
              <p className="font-outfit m-0" style={{ fontSize: 14, lineHeight: 1.3, color: TEXT_DARK }}>
                J’accepte les{' '}
                <button type="button" onClick={() => setLegalText(TERMS)} className="font-outfit" style={linkStyle}>
                  Conditions d’utilisation
                </button>{' '}
                et la{' '}
                <button type="button" onClick={() => setLegalText(PRIVACY_POLICY)} className="font-outfit" style={linkStyle}>
                  Politique de confidentialité
                </button>
                .
              </p>
            </div>
          </div>

          {/* Moins de 15 ans (Figma : mineurs) */}
          <div className="flex items-start" style={{ gap: 8, padding: '0 4px' }}>
            <Info size={18} color="#FFFFFF" strokeWidth={2} className="shrink-0" />
            <span className="font-outfit" style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.95)' }}>
              Tu as moins de 15 ans ? Il te faut l’accord d’un parent pour t’inscrire.
            </span>
          </div>
        </div>

        {/* Bouton en bas de l'écran */}
        <div className="flex flex-col" style={{ marginTop: 'auto', paddingTop: 24, gap: 10 }}>
          {errorMessage ? (
            <p className="font-outfit text-center text-white m-0" style={{ fontSize: 14 }}>{errorMessage}</p>
          ) : null}
          <Button
            title="Accepter et continuer"
            onPress={handleAccept}
            disabled={!accepted}
            loading={loading}
            color="#FFFFFF"
            textColor={theme.primary}
            icon={<Check size={20} color={theme.primary} strokeWidth={2.5} />}
          />
        </div>
      </div>

      {legalText && <LegalOverlay text={legalText} onClose={() => setLegalText(null)} />}
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChartLine, Award, Users } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import { mascotteTribu } from '../assets';
import Input from '../components/Input';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../api';

// Couleurs Figma (creer-tribu)
const TEXT_TITLE = '#1C1F1C';
const TEXT_MUTED = '#6B7570';
const CARD_BORDER = '#E0E7E4';
const CARD_SHADOW = '0px 4px 6px rgba(0, 0, 0, 0.1)';

const BENEFITS = [
  { Icon: ChartLine, title: 'Niveau de la famille', text: 'Démarrez au niveau 1 et progressez ensemble.' },
  { Icon: Award, title: 'Badges à collectionner', text: 'Débloquez des badges thématiques au fil des activités.' },
  { Icon: Users, title: 'Défis en famille', text: 'Activités à la maison ou sorties chez nos partenaires.' },
];

export default function CreateFamily() {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateFamily = async () => {
    if (!user || loading) return;

    if (!name.trim() || !city.trim()) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // 1 - Créer la famille
      const response = await api('families', {
        method: 'POST',
        body: { name: name.trim(), city: city.trim() },
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      // 2 - Le backend rattache déjà le créateur à sa Tribu :
      //     on met à jour le store utilisateur (déclenche le chargement de la Tribu)
      const familyId = data.family.id;
      setUser(prev => (prev ? { ...prev, familyId } : prev));

      // 3 - Retour à l'accueil
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur :', error);
      setErrorMessage('Impossible de se connecter au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Créer ma Tribu" />

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col" style={{ padding: '8px 17px 28px', paddingBottom: 'calc(28px + env(safe-area-inset-bottom))', gap: 12 }}>
        {/* En-tête : carte mascotte + titre */}
        <div className="flex items-center bg-white" style={{ boxShadow: CARD_SHADOW, gap: 12, padding: 12, borderRadius: 16 }}>
          <div
            className="flex items-center justify-center rounded-full overflow-hidden shrink-0"
            style={{ width: 65, height: 65, backgroundColor: 'rgba(32, 193, 177, 0.1)' }}
          >
            <img src={mascotteTribu} alt="" style={{ width: 65, height: 65, objectFit: 'contain' }} />
          </div>
          <div className="flex-1 flex flex-col" style={{ gap: 3, paddingBottom: 4 }}>
            <span className="font-outfit-bold" style={{ fontSize: 17, color: TEXT_TITLE }}>Votre Tribu prend vie</span>
            <span className="font-outfit" style={{ fontSize: 13, lineHeight: '18px', color: TEXT_MUTED }}>
              Un nom et une ville suffisent !
            </span>
          </div>
        </div>

        {/* Nom */}
        <label className="flex flex-col" style={{ gap: 9 }}>
          <span className="font-outfit text-base" style={{ color: '#000000' }}>Nom de votre Tribu :</span>
          <Input value={name} onChangeText={setName} placeholder="Ex : DreamTeam" color={theme.primary} />
        </label>

        {/* Ville */}
        <label className="flex flex-col" style={{ gap: 9 }}>
          <span className="font-outfit text-base" style={{ color: '#000000' }}>Ville :</span>
          <Input value={city} onChangeText={setCity} placeholder="Ex : Angers" color={theme.primary} onSubmitEditing={handleCreateFamily} returnKeyType="done" />
        </label>

        {/* Ce qui attend votre Tribu (informatif) */}
        <div
          className="bg-white flex flex-col"
          style={{ marginTop: 4, borderRadius: 18, border: `1px solid ${CARD_BORDER}`, padding: '18px 18px 6px' }}
        >
          <span className="font-outfit-bold" style={{ fontSize: 15, color: TEXT_TITLE, marginBottom: 6 }}>
            Ce qui attend votre Tribu
          </span>

          {BENEFITS.map(({ Icon, title, text }, index) => (
            <div
              key={title}
              className="flex items-center"
              style={{ gap: 14, padding: '12px 0', borderTop: index === 0 ? 'none' : `1px solid ${CARD_BORDER}` }}
            >
              <span
                className="flex items-center justify-center shrink-0"
                style={{ width: 40, height: 40, borderRadius: 16, backgroundColor: theme.transparent }}
              >
                <Icon size={24} color={theme.primary} strokeWidth={2} />
              </span>
              <span className="flex-1 flex flex-col" style={{ gap: 2 }}>
                <span className="font-outfit-bold" style={{ fontSize: 14, color: TEXT_TITLE }}>{title}</span>
                <span className="font-outfit" style={{ fontSize: 12, lineHeight: '17px', color: TEXT_MUTED }}>{text}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Bouton juste sous le contenu (comme la maquette) */}
        <div style={{ marginTop: 22 }}>
          {errorMessage ? (
            <p className="font-outfit text-center m-0 mb-2" style={{ color: '#EA4A1F' }}>{errorMessage}</p>
          ) : null}
          <Button title="Créer ma Tribu" onPress={handleCreateFamily} loading={loading} color={theme.primary} />
        </div>
      </div>
    </div>
  );
}

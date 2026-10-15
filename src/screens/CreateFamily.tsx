import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChartLine, Award, Users, ChevronDown, Check } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import { mascotteTribu } from '../assets';
import Input from '../components/Input';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../api';
import { CITIES } from '../config';

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
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const chooseCity = (value: string) => {
    setCity(value);
    setCityMenuOpen(false);
  };

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
            <span className="font-outfit-bold" style={{ fontSize: 20, color: TEXT_TITLE }}>Votre Tribu prend vie</span>
            <span className="font-outfit" style={{ fontSize: 14, color: TEXT_MUTED }}>
              Un nom et une ville suffisent !
            </span>
          </div>
        </div>

        {/* Nom */}
        <label className="flex flex-col" style={{ gap: 9 }}>
          <span className="font-outfit text-base" style={{ color: '#000000' }}>Nom de votre Tribu :</span>
          <Input value={name} onChangeText={setName} placeholder="Ex : DreamTeam" color={theme.primary} />
        </label>

        {/* Ville : liste déroulante (Figma : input-dropdown) */}
        <div className="flex flex-col" style={{ gap: 9 }}>
          <span id="city-label" className="font-outfit text-base" style={{ color: '#000000' }}>Ville :</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCityMenuOpen(open => !open)}
              aria-haspopup="listbox"
              aria-expanded={cityMenuOpen}
              aria-labelledby="city-label"
              className="w-full flex items-center font-outfit text-base text-left"
              style={{
                height: 48,
                padding: '0 12px',
                gap: 10,
                border: `1px solid ${cityMenuOpen ? theme.primary : '#969696'}`,
                borderRadius: 16,
                backgroundColor: '#FAFAFA',
                color: city ? '#161616' : '#969696',
              }}
            >
              <span className="flex-1">{city || 'Choisis ta ville'}</span>
              <ChevronDown
                size={20}
                color="#161616"
                style={{ transform: cityMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>

            {/* Liste des villes, sous le champ */}
            {cityMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCityMenuOpen(false)} />
                <ul
                  role="listbox"
                  aria-labelledby="city-label"
                  className="absolute z-20 left-0 right-0 bg-white flex flex-col m-0"
                  style={{ top: 52, padding: 6, borderRadius: 16, listStyle: 'none', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)' }}
                >
                  {CITIES.map(value => {
                    const isSelected = value === city;
                    return (
                      <li key={value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => chooseCity(value)}
                          className="w-full flex items-center justify-between font-outfit text-base text-left"
                          style={{ padding: '10px 12px', borderRadius: 10, border: 'none', color: '#161616', backgroundColor: isSelected ? theme.transparent : 'transparent' }}
                        >
                          {value}
                          {isSelected && <Check size={16} color={theme.primary} strokeWidth={3} />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Ce qui attend votre Tribu (informatif) */}
        <div
          className="bg-white flex flex-col"
          style={{ marginTop: 4, borderRadius: 18, border: `1px solid ${CARD_BORDER}`, padding: '18px 18px 6px' }}
        >
          <span className="font-outfit-bold" style={{ fontSize: 16, color: TEXT_TITLE, marginBottom: 6 }}>
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
                <span className="font-outfit" style={{ fontSize: 14, color: TEXT_TITLE }}>{title}</span>
                <span className="font-outfit" style={{ fontSize: 14, color: TEXT_MUTED }}>{text}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Bouton juste sous le contenu (comme la maquette) */}
        <div>
          {errorMessage ? (
            <p className="font-outfit text-center m-0 mb-2" style={{ color: '#EA4A1F' }}>{errorMessage}</p>
          ) : null}
          <Button title="Créer ma Tribu" onPress={handleCreateFamily} loading={loading} color={theme.primary} />
        </div>
      </div>
    </div>
  );
}

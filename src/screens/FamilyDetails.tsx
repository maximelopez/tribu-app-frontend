import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useUserStore } from '../store/userStore';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { api } from '../api';

interface FamilyInfo {
  id: string;
  name: string;
  city: string;
}

// Écran simple en attendant la maquette finale (identique à mobile)
export default function FamilyDetails() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = useUserStore(state => state.user);

  const [familyDetails, setFamilyDetails] = useState<FamilyInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const response = await api(`families/${familyId}`);
        const data = await response.json();
        if (response.ok) setFamilyDetails(data.family);
      } catch (error) {
        console.error('Erreur fetch famille :', error);
      }
    };
    fetchFamily();
  }, [familyId]);

  const handleJoinFamily = async () => {
    if (!user || !familyDetails) return;

    setLoading(true);
    try {
      const response = await api(`families/${familyDetails.id}/join-requests`, {
        method: 'POST',
      });

      if (!response.ok) {
        setErrorMessage('Impossible de rejoindre cette famille.');
        return;
      }

      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur rejoindre famille :', error);
      setErrorMessage('Erreur serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Détails de la Tribu" />

      {familyDetails && (
        <div className="flex-1 flex flex-col" style={{ margin: '40px 24px 0' }}>
          <h2 className="text-xl text-center font-outfit-bold font-normal m-0 mb-2" style={{ color: theme.primary }}>
            {familyDetails.name}
          </h2>
          <p className="text-lg text-center text-gray-600 font-outfit m-0 mb-8">Ville : {familyDetails.city}</p>

          {errorMessage && <p className="text-red-500 m-0 mb-4">{errorMessage}</p>}

          <Button title="Envoyer une demande" onPress={handleJoinFamily} loading={loading} color={theme.primary} />
        </div>
      )}
    </div>
  );
}

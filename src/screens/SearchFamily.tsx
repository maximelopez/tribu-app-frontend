import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, Search, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAvatar, mascotteLunettes, mascotteNoResults } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import FloatingMascot from '../components/FloatingMascot';
import { api } from '../api';

const CARD_SHADOW = '0px 4px 6px rgba(22, 22, 22, 0.08)';
const AVATAR_SIZE = 42;

interface FamilyMemberPreview {
  id: string;
  avatar: number | null;
}

interface FamilyResult {
  id: string;
  name: string;
  city: string;
  levelInfo: { level: number };
  membersCount: number;
  membersPreview: FamilyMemberPreview[];
}

// Rejoindre une Tribu : recherche par nom et filtre par ville (Figma : join-the-family, state-avant-chercher, no-results)
export default function SearchFamily() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  // Ville choisie dans le filtre (null : toutes)
  const [city, setCity] = useState<string | null>(null);
  // Villes où il existe des Tribus (chargées à l'ouverture de l'écran)
  const [cities, setCities] = useState<string[]>([]);
  const [families, setFamilies] = useState<FamilyResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api('families/cities');
        const data = await response.json();
        if (response.ok) setCities(data.cities);
      } catch (error) {
        console.error('Erreur chargement des villes :', error);
      }
    };
    fetchCities();
  }, []);

  // Recherche dès 1 caractère, ou dès qu'une ville est choisie
  const query = search.trim();
  const isSearching = query.length > 0 || city !== null;

  useEffect(() => {
    if (!isSearching) return;

    // Petit délai : on attend que l'utilisateur ait fini de taper
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (city) params.set('city', city);
        const response = await api(`families?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) return;
        setFamilies(data.families);
        setHasSearched(true);
      } catch (error) {
        console.error('Erreur recherche familles :', error);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, city, isSearching]);

  // Plus de texte ni de ville : on efface les résultats
  const clearIfEmpty = (nextSearch: string, nextCity: string | null) => {
    if (!nextSearch.trim() && nextCity === null) {
      setFamilies([]);
      setHasSearched(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <ScreenHeader title="Rejoindre une Tribu" />

      <div className="px-4 pt-2 flex flex-col gap-4 shrink-0">
        {/* Barre de recherche */}
        <div
          className="flex items-center bg-white"
          style={{ height: 48, borderRadius: 18, border: '1px solid #CBD5E0', padding: '0 14px', gap: 10 }}
        >
          <Search size={18} color="#757575" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              clearIfEmpty(e.target.value, city);
            }}
            placeholder="Rechercher une Tribu"
            aria-label="Rechercher une Tribu"
            type="search"
            enterKeyHint="search"
            autoCorrect="off"
            className="flex-1 min-w-0 font-outfit text-base placeholder:text-[#757575]"
            style={{ color: '#161616', border: 'none', outline: 'none', background: 'transparent', caretColor: theme.primary }}
          />
        </div>

        {/* Filtrer par ville : toujours visible (Figma : filtre-ville) */}
        {cities.length > 0 && (
          <div className="flex flex-col" style={{ gap: 10 }}>
            <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>Filtrer par ville</span>
            <div className="flex overflow-x-auto no-scrollbar" style={{ gap: 8, margin: '0 -16px', padding: '0 16px' }}>
              {[null, ...cities].map(value => {
                const isActive = value === city;
                return (
                  <button
                    key={value ?? 'all'}
                    onClick={() => {
                      setCity(value);
                      clearIfEmpty(search, value);
                    }}
                    aria-pressed={isActive}
                    className="rounded-full flex items-center justify-center shrink-0 font-outfit"
                    style={{
                      fontSize: 14,
                      height: 36,
                      padding: isActive ? '0 16px 0 12px' : '0 16px',
                      gap: 6,
                      backgroundColor: isActive ? theme.primary : '#FFFFFF',
                      border: `1px solid ${isActive ? theme.primary : '#CBD5E0'}`,
                      color: isActive ? '#FFFFFF' : '#0F1A14',
                    }}
                  >
                    {isActive && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                    {value ?? 'Toutes'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {families.length > 0 && (
          <span className="font-outfit-bold text-base" style={{ color: '#161616' }}>Résultats</span>
        )}
      </div>

      {!isSearching ? (
        // Rien de tapé ni de ville choisie (Figma : state-avant-chercher)
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: 20, padding: '0 50px 120px' }}>
          <FloatingMascot image={mascotteLunettes} circleColor="rgba(255, 157, 0, 0.1)" />
          <span className="font-outfit text-base" style={{ color: '#111' }}>Trouve ta Tribu</span>
          <p className="font-outfit text-center m-0" style={{ fontSize: 14, lineHeight: 1.4, color: '#777777' }}>
            Tape le nom de la Tribu que tu veux rejoindre, puis envoie ta demande. Un membre de ta famille peut te le donner.
          </p>
        </div>
      ) : hasSearched && families.length === 0 ? (
        // Aucun résultat (Figma : no-results)
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: 20, padding: '0 50px 80px' }}>
          <FloatingMascot image={mascotteNoResults} circleColor="rgba(234, 74, 31, 0.1)" />
          <span className="font-outfit text-base" style={{ color: '#111' }}>Aucune Tribu trouvée :(</span>
          <p className="font-outfit text-center m-0" style={{ fontSize: 14, lineHeight: 1.4, color: '#777777' }}>
            Vérifie l’orthographe ou demande le nom exact de la Tribu à un membre de ta famille.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '12px 16px 24px' }}>
          <div className="flex flex-col" style={{ gap: 18 }}>
            {families.map(item => {
              const extraCount = item.membersCount - item.membersPreview.length;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(`/tribu/${item.id}`)}
                  className="bg-white rounded-2xl p-4 flex flex-col text-left"
                  style={{ boxShadow: CARD_SHADOW, gap: 14, border: 'none' }}
                >
                  {/* Avatars + nom + nombre de membres */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex shrink-0">
                      {item.membersPreview.map((member, index) => (
                        <img
                          key={member.id}
                          src={getAvatar(member.avatar)}
                          alt=""
                          className="rounded-full"
                          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, border: '2px solid #FFFFFF', marginLeft: index === 0 ? 0 : -13, objectFit: 'cover' }}
                        />
                      ))}
                      {extraCount > 0 && (
                        <span
                          className="rounded-full flex items-center justify-center font-outfit-bold"
                          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, border: '2px solid #FFFFFF', marginLeft: -13, backgroundColor: '#E4E7E4', fontSize: 13, color: '#677067' }}
                        >
                          +{extraCount}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="font-outfit-bold text-base truncate" style={{ color: '#161616' }}>{item.name}</span>
                      <span className="font-outfit text-sm" style={{ color: '#969696' }}>
                        {item.membersCount} membre{item.membersCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    <ChevronRight size={24} color="#969696" />
                  </div>

                  {/* Niveau + ville */}
                  <div className="flex items-center gap-2 w-full" style={{ borderTop: '1px solid #CBD5E0', paddingTop: 15 }}>
                    {[`Niveau ${item.levelInfo.level}`, item.city].map(label => (
                      <span
                        key={label}
                        className="rounded-full flex items-center font-outfit text-sm"
                        style={{ height: 25, padding: '0 9px', backgroundColor: theme.transparent, color: theme.primary }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

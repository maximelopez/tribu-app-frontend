import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAvatar, mascotteNoResults } from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import { API_URL } from '../config';

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

export default function SearchFamily() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [families, setFamilies] = useState<FamilyResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const query = search.trim();

    if (query.length < 2) {
      setFamilies([]);
      setHasSearched(false);
      return;
    }

    // Petit délai : on attend que l'utilisateur ait fini de taper
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}families?search=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!response.ok) return;
        setFamilies(data.families);
        setHasSearched(true);
      } catch (error) {
        console.error('Erreur recherche familles :', error);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

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
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une Tribu"
            type="search"
            enterKeyHint="search"
            autoCorrect="off"
            className="flex-1 min-w-0 font-outfit text-base placeholder:text-[#757575]"
            style={{ color: '#161616', border: 'none', outline: 'none', background: 'transparent', caretColor: theme.primary }}
          />
        </div>

        {families.length > 0 && (
          <span className="font-outfit text-base" style={{ color: '#000' }}>Résultats :</span>
        )}
      </div>

      {hasSearched && families.length === 0 ? (
        // Aucun résultat
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: 20, paddingBottom: 80 }}>
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 135, height: 135, backgroundColor: 'rgba(234, 74, 31, 0.1)' }}
          >
            <img src={mascotteNoResults} alt="" style={{ width: 110, height: 110, objectFit: 'contain' }} />
          </div>
          <span className="font-outfit text-base" style={{ color: '#111' }}>Aucune Tribu trouvée :(</span>
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

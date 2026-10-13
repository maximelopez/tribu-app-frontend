import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { Activity, Category } from '../store/familyStore';
import ActivityCard from '../components/ActivityCard';
import { api } from '../api';

// Couleurs Figma
const TEXT_STRONG = '#161616';
const TEXT_DARK = '#111111';
const TEXT_GREY = '#969696';
const BORDER_GREY = '#969696';
const CHIP_BORDER = '#CBD5E0';
const CHIP_TEXT = '#0F1A14';

// Filtres de la maquette : identifiant en base -> libellé affiché
const CATEGORY_FILTERS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Tout' },
  { value: 'cinema', label: 'Cinéma' },
  { value: 'sport', label: 'Sport' },
  { value: 'culture', label: 'Culture' },
  { value: 'parcs', label: 'Parcs' },
  { value: 'autre', label: 'Autre' },
];

export default function Activities() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [includePartners, setIncludePartners] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api('activities');
        const data = await response.json();
        if (response.ok) setActivities(data);
      } catch (error) {
        console.error('Erreur fetch activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter(activity => {
      // Recherche texte
      if (query) {
        const haystack = `${activity.name} ${activity.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      // Offres partenaires
      if (!includePartners && activity.isPartner) return false;
      // Catégorie
      if (selectedCategory !== 'all' && activity.category !== selectedCategory) return false;
      return true;
    });
  }, [activities, search, includePartners, selectedCategory]);

  const count = filteredActivities.length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <h1 className="font-outfit-bold text-xl text-center font-normal" style={{ color: TEXT_STRONG, margin: '16px 0 20px' }}>
        Activités
      </h1>

      <div className="flex flex-col" style={{ padding: '0 16px 24px', gap: 12 }}>
        {/* Recherche */}
        <div
          className="flex items-center bg-white"
          style={{ height: 48, borderRadius: 16, border: `1px solid ${BORDER_GREY}`, padding: '0 12px', gap: 8 }}
        >
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ex : bowling"
            type="search"
            enterKeyHint="search"
            className="flex-1 min-w-0 font-outfit text-base placeholder:text-[#969696]"
            style={{ color: TEXT_STRONG, border: 'none', outline: 'none', background: 'transparent', caretColor: theme.primary }}
          />
          <Search size={22} color={TEXT_GREY} strokeWidth={2} />
        </div>

        {/* Filtres par catégorie */}
        <span className="font-outfit text-base" style={{ color: TEXT_DARK }}>Filtres par :</span>
        <div className="flex overflow-x-auto no-scrollbar" style={{ margin: '0 -16px', padding: '0 16px', gap: 8 }}>
          {CATEGORY_FILTERS.map(({ value, label }) => {
            const isActive = value === selectedCategory;
            return (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className="rounded-full flex items-center justify-center shrink-0 font-outfit text-sm"
                style={{
                  height: 34,
                  padding: '0 14px',
                  backgroundColor: isActive ? theme.primary : '#FFFFFF',
                  border: isActive ? 'none' : `1px solid ${CHIP_BORDER}`,
                  color: isActive ? '#FFFFFF' : CHIP_TEXT,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Offres partenaires */}
        <label
          className="flex items-center justify-between bg-white"
          style={{ height: 48, borderRadius: 16, border: `1px solid ${BORDER_GREY}`, padding: '0 14px' }}
        >
          <span className="font-outfit text-sm" style={{ color: TEXT_STRONG }}>Inclure les offres partenaires</span>
          {/* Interrupteur (équivalent du Switch natif) */}
          <button
            role="switch"
            aria-checked={includePartners}
            onClick={() => setIncludePartners(v => !v)}
            className="relative shrink-0"
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              border: 'none',
              backgroundColor: includePartners ? theme.primary : CHIP_BORDER,
              transition: 'background-color 0.2s',
            }}
          >
            <span
              className="absolute bg-white rounded-full"
              style={{
                top: 3,
                left: includePartners ? 23 : 3,
                width: 24,
                height: 24,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </label>

        <span className="font-outfit text-base" style={{ color: TEXT_DARK }}>
          {count} activité{count > 1 ? 's' : ''} trouvée{count > 1 ? 's' : ''}
        </span>

        {/* Liste */}
        {filteredActivities.length === 0 ? (
          <p className="font-outfit text-base text-center" style={{ color: TEXT_GREY, marginTop: 24 }}>
            Aucune activité ne correspond à ta recherche
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {filteredActivities.map(item => (
              <ActivityCard
                key={item._id}
                name={item.name}
                description={item.description}
                isPartner={item.isPartner}
                onPress={() => navigate(`/activites/${item._id}`, { state: { activity: item } })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

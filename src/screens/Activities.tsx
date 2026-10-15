import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronDown, ChevronLeft, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFamilyStore } from '../store/familyStore';
import type { Activity, Category } from '../store/familyStore';
import ActivityTile, { CATEGORY_LABELS } from '../components/ActivityTile';
import ActivityCarousel from '../components/ActivityCarousel';
import useCatalog, { sortByNewest } from '../hooks/useCatalog';
import Spinner from '../components/Spinner';
import { mascotteActivity } from '../assets';
import FloatingMascot from '../components/FloatingMascot';

// Couleurs Figma
const TEXT_STRONG = '#161616';
const TEXT_DARK = '#111111';
const TEXT_GREY = '#969696';
const BORDER_GREY = '#969696';
const CHIP_BORDER = '#CBD5E0';
const CHIP_TEXT = '#0F1A14';

// Nombre d'activités dans « Les nouveautés »
const NEW_COUNT = 6;

// Filtres par catégorie : « Tout » puis les catégories
const CATEGORY_FILTERS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'Tout' },
  ...(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => ({ value, label })),
];

type SectionId = 'local' | 'new';

// Catalogue d'activités (Figma : activites-variante-klub)
export default function Activities() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const familyCity = useFamilyStore(state => state.family?.city) ?? null;

  const { activities, isLoading } = useCatalog();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  // Ville choisie par l'utilisateur (undefined : pas encore choisie, on prend celle de la Tribu). null = toutes les villes
  const [chosenCity, setChosenCity] = useState<string | null | undefined>(undefined);
  const city = chosenCity === undefined ? familyCity : chosenCity;
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  // Section ouverte avec « Tout voir » (null : les deux carrousels)
  const [openSection, setOpenSection] = useState<SectionId | null>(null);

  // Villes proposées : celles du catalogue (et celle de la Tribu)
  const cities = useMemo(() => {
    const all = new Set(activities.map(a => a.city).filter((c): c is string => !!c));
    if (familyCity) all.add(familyCity);
    return [...all].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [activities, familyCity]);

  // Recherche, catégorie et ville (une activité sans ville se fait partout)
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activities.filter(activity => {
      if (query && !`${activity.name} ${activity.description}`.toLowerCase().includes(query)) return false;
      if (selectedCategory !== 'all' && activity.category !== selectedCategory) return false;
      if (city && activity.city && activity.city !== city) return false;
      return true;
    });
  }, [activities, search, selectedCategory, city]);

  // Les plus récentes d'abord
  const newest = useMemo(() => sortByNewest(filtered).slice(0, NEW_COUNT), [filtered]);

  const sections: { id: SectionId; title: string; items: Activity[] }[] = [
    { id: 'local', title: city ? `À faire à ${city}` : 'À faire en famille', items: filtered },
    { id: 'new', title: 'Les nouveautés', items: newest },
  ];
  const visibleSections = sections.filter(s => s.items.length > 0 && (!openSection || s.id === openSection));

  const openActivity = (activity: Activity) => navigate(`/activites/${activity._id}`, { state: { activity } });

  const chooseCity = (value: string | null) => {
    setChosenCity(value);
    setCityMenuOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* En-tête : titre et ville */}
      <div className="relative" style={{ padding: '16px 16px 0' }}>
        <h1 className="font-outfit-bold font-normal m-0" style={{ fontSize: 20, color: TEXT_STRONG }}>Activités</h1>
        <button
          onClick={() => setCityMenuOpen(open => !open)}
          aria-haspopup="listbox"
          aria-expanded={cityMenuOpen}
          className="flex items-center font-outfit-bold text-base p-0"
          style={{ gap: 4, marginTop: 2, color: theme.primary, background: 'none', border: 'none', textTransform: 'uppercase' }}
        >
          {city ?? 'Toutes les villes'}
          <ChevronDown size={18} color={theme.primary} strokeWidth={2.5} />
        </button>

        {/* Choix de la ville */}
        {cityMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setCityMenuOpen(false)} />
            <ul
              role="listbox"
              aria-label="Choisir une ville"
              className="absolute z-20 bg-white flex flex-col m-0"
              style={{ left: 16, top: 72, minWidth: 200, padding: 6, borderRadius: 16, listStyle: 'none', boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)' }}
            >
              {[null, ...cities].map(value => {
                const isSelected = value === city;
                return (
                  <li key={value ?? 'all'}>
                    <button
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => chooseCity(value)}
                      className="w-full flex items-center justify-between font-outfit text-base text-left"
                      style={{ padding: '10px 12px', gap: 12, borderRadius: 10, border: 'none', color: TEXT_STRONG, backgroundColor: isSelected ? theme.transparent : 'transparent' }}
                    >
                      {value ?? 'Toutes les villes'}
                      {isSelected && <Check size={16} color={theme.primary} strokeWidth={3} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-col" style={{ padding: '20px 0 24px', gap: 20 }}>
        {/* Recherche */}
        <div style={{ padding: '0 16px' }}>
          <div
            className="flex items-center bg-white"
            style={{ height: 48, borderRadius: 16, border: `1px solid ${BORDER_GREY}`, padding: '0 12px', gap: 8 }}
          >
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="pique-nique, bowling, cinéma…"
              aria-label="Rechercher une activité"
              type="search"
              enterKeyHint="search"
              className="flex-1 min-w-0 font-outfit text-base placeholder:text-[#969696]"
              style={{ color: TEXT_STRONG, border: 'none', outline: 'none', background: 'transparent', caretColor: theme.primary }}
            />
            <Search size={24} color={TEXT_GREY} strokeWidth={2} />
          </div>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex overflow-x-auto no-scrollbar" style={{ padding: '0 16px', gap: 8 }}>
          {CATEGORY_FILTERS.map(({ value, label }) => {
            const isActive = value === selectedCategory;
            return (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                aria-pressed={isActive}
                className="rounded-full flex items-center justify-center shrink-0 font-outfit"
                style={{
                  fontSize: 14,
                  height: 36,
                  padding: isActive ? '0 16px 0 12px' : '0 16px',
                  gap: 6,
                  backgroundColor: isActive ? theme.primary : '#FFFFFF',
                  border: `1px solid ${isActive ? theme.primary : CHIP_BORDER}`,
                  color: isActive ? '#FFFFFF' : CHIP_TEXT,
                }}
              >
                {/* Coche sur le filtre sélectionné (Figma : chip-filtre) */}
                {isActive && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                {label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex justify-center" style={{ marginTop: 32 }}>
            <Spinner size={36} color={theme.primary} />
          </div>
        ) : visibleSections.length === 0 ? (
          // Aucun résultat (Figma : activities-empy-state)
          <div className="flex flex-col items-center" style={{ gap: 20, marginTop: 28 }}>
            <FloatingMascot image={mascotteActivity} circleColor={theme.transparent} />
            <span className="font-outfit text-base" style={{ color: TEXT_DARK }}>Aucune activité trouvée :(</span>
          </div>
        ) : (
          visibleSections.map(section =>
            openSection ? (
              // « Tout voir » : toute la section, en liste
              <section key={section.id} className="flex flex-col" style={{ gap: 12 }}>
                <div className="flex items-center" style={{ padding: '0 16px', gap: 6 }}>
                  <button
                    onClick={() => setOpenSection(null)}
                    aria-label="Retour aux activités"
                    className="flex items-center justify-center shrink-0 p-0"
                    style={{ background: 'none', border: 'none' }}
                  >
                    <ChevronLeft size={24} color={TEXT_STRONG} strokeWidth={2} />
                  </button>
                  <h2 className="font-outfit-bold font-normal m-0 truncate" style={{ fontSize: 20, color: TEXT_STRONG }}>
                    {section.title}
                  </h2>
                </div>
                <div className="flex flex-col" style={{ padding: '0 16px', gap: 12 }}>
                  {section.items.map(item => (
                    <ActivityTile key={item._id} activity={item} fullWidth onPress={() => openActivity(item)} />
                  ))}
                </div>
              </section>
            ) : (
              <ActivityCarousel
                key={section.id}
                title={section.title}
                activities={section.items}
                onSeeAll={() => setOpenSection(section.id)}
              />
            )
          )
        )}
      </div>
    </div>
  );
}

import { Navigate, Outlet, Route, Routes } from 'react-router';
import { useUserStore } from './store/userStore';
import useFamilyData from './hooks/useFamilyData';
import useRealtime from './hooks/useRealtime';
import TabBar from './components/TabBar';

import Signup from './screens/Signup';
import Login from './screens/Login';
import Birthdate from './screens/Birthdate';
import ThemeSelection from './screens/ThemeSelection';
import AvatarSelection from './screens/AvatarSelection';
import LoadingScreen from './screens/LoadingScreen';
import Home from './screens/Home';
import Rewards from './screens/Rewards';
import Activities from './screens/Activities';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import SearchFamily from './screens/SearchFamily';
import CreateFamily from './screens/CreateFamily';
import FamilyDetails from './screens/FamilyDetails';
import ActivityDetail from './screens/ActivityDetail';
import ActivityReward from './screens/ActivityReward';
import ActivityHistory from './screens/ActivityHistory';

// Cadre "téléphone" : largeur mobile, centré sur grand écran
function PhoneFrame() {
  return (
    <div className="h-full flex justify-center">
      <div
        className="relative w-full h-full flex flex-col overflow-hidden"
        style={{ maxWidth: 430, backgroundColor: '#F3F3F8', boxShadow: '0 0 24px rgba(0,0,0,0.06)' }}
      >
        <Outlet />
      </div>
    </div>
  );
}

// Utilisateur connecté : données de la Tribu + temps réel, actifs sur tous les écrans
function AuthenticatedLayout() {
  useFamilyData();
  useRealtime();
  return <Outlet />;
}

// Écrans avec la barre de navigation du bas (équivalent des onglets de mobile)
function TabsLayout() {
  return (
    <>
      <main className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </main>
      <TabBar />
    </>
  );
}

// Même logique que MainNavigator dans mobile :
// pas connecté -> inscription / connexion, onboarding pas fini -> onboarding, sinon l'app
export default function App() {
  const user = useUserStore(state => state.user);
  const token = useUserStore(state => state.token);
  const onboardingCompleted = useUserStore(state => state.onboardingCompleted);

  return (
    <Routes>
      <Route element={<PhoneFrame />}>
        {!user || !token ? (
          <>
            <Route path="/inscription" element={<Signup />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="*" element={<Navigate to="/inscription" replace />} />
          </>
        ) : !onboardingCompleted ? (
          <>
            <Route path="/bienvenue/naissance" element={<Birthdate />} />
            <Route path="/bienvenue/couleur" element={<ThemeSelection />} />
            <Route path="/bienvenue/avatar" element={<AvatarSelection />} />
            <Route path="/bienvenue/chargement" element={<LoadingScreen />} />
            <Route path="*" element={<Navigate to="/bienvenue/naissance" replace />} />
          </>
        ) : (
          <Route element={<AuthenticatedLayout />}>
            <Route element={<TabsLayout />}>
              <Route index element={<Home />} />
              <Route path="/recompenses" element={<Rewards />} />
              <Route path="/activites" element={<Activities />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/profil" element={<Profile />} />
            </Route>

            {/* Écrans "empilés" (sans barre du bas) */}
            <Route path="/tribu/rechercher" element={<SearchFamily />} />
            <Route path="/tribu/creer" element={<CreateFamily />} />
            <Route path="/tribu/:familyId" element={<FamilyDetails />} />
            <Route path="/activites/:activityId" element={<ActivityDetail />} />
            <Route path="/recompense" element={<ActivityReward />} />
            <Route path="/historique" element={<ActivityHistory />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Route>
    </Routes>
  );
}

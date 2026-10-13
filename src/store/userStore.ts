import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ThemeColor } from '../context/ThemeContext';

export interface User {
  id: string;
  name: string;
  email: string;
  points?: number;
  familyId: string | null;
  avatar: number | null;
  theme?: ThemeColor;
  birthdate?: string | null;
}

interface UserStore {
  user: User | null;
  onboardingCompleted: boolean;
  setUser: (user: User | ((prev: User | null) => User | null)) => void;
  setOnboardingCompleted: (val: boolean) => void;
  logout: () => void;
}

// Même logique que mobile, sauvegardé dans le localStorage du navigateur
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      onboardingCompleted: false,
      setUser: (userOrUpdater) =>
        set((state) => ({
          user:
            typeof userOrUpdater === 'function'
              ? (userOrUpdater as (prev: User | null) => User | null)(state.user)
              : userOrUpdater,
        })),
      setOnboardingCompleted: (val) => set({ onboardingCompleted: val }),
      logout: () => set({ user: null, onboardingCompleted: false }),
    }),
    {
      name: 'tribu:auth:user',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

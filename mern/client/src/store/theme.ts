import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState { dark: boolean; toggle: () => void; }
export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const dark = !get().dark;
        set({ dark });
        document.documentElement.classList.toggle('dark', dark);
      },
    }),
    {
      name: 'samagama-theme',
      onRehydrateStorage: () => (s) => {
        if (s?.dark) document.documentElement.classList.add('dark');
      },
    }
  )
);

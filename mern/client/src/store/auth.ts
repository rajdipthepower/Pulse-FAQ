import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'student' | 'faculty' | 'moderator' | 'admin';
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  photo?: string;
}

interface State {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (u: AuthUser, a: string, r: string) => void;
  logout: () => void;
}

export const useAuth = create<State>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'samagama-auth' }
  )
);

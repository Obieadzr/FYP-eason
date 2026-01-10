// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      login: (userData) => set({ user: userData, isAuthenticated: true, loading: false }),

      logout: async () => {
        try {
          await fetch('http://localhost:5000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (err) {
          console.error('Logout failed:', err);
        }
        set({ user: null, isAuthenticated: false, loading: false });
      },

      checkAuth: async () => {
        try {
          set({ loading: true });
          const res = await fetch('http://localhost:5000/api/auth/me', {
            credentials: 'include', // sends the httpOnly cookie
          });

          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'eason-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../utils/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      login: (userData) => {
        set({ 
          user: userData, 
          isAuthenticated: true, 
          loading: false 
        });
      },

      logout: () => {
        localStorage.removeItem("eason_token");
        set({ user: null, isAuthenticated: false, loading: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("eason_token");
        if (!token) {
          set({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        try {
          const res = await API.get("/auth/me");
          set({ 
            user: res.data.user, 
            isAuthenticated: true, 
          });
        } catch (err) {
          localStorage.removeItem("eason_token");
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "eason-auth",
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        loading: false // instantly unblock UI if rehydrating from cache
      }),
    }
  )
);
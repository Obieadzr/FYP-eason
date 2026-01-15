import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../utils/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      login: (userData) => {
        console.log("[authStore] LOGIN →", userData);
        set({
          user: userData,
          isAuthenticated: true,
          loading: false,
        });
      },

      logout: () => {
        console.log("[authStore] LOGOUT");
        localStorage.removeItem("eason_token");
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      },

      checkAuth: async () => {
        set({ loading: true });
        const token = localStorage.getItem("eason_token");

        if (!token) {
          console.log("[checkAuth] No token");
          set({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        try {
          const res = await API.get("/auth/me");
          console.log("[checkAuth] Success:", res.data.user);
          set({
            user: res.data.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (err) {
          console.warn("[checkAuth] Failed:", err.message);
          localStorage.removeItem("eason_token");
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: "eason-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
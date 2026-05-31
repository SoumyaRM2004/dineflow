"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, LoginRequest, RegisterRequest, User } from "@/types";
import apiClient from "@/lib/api-client";
import { AxiosError } from "axios";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/login", credentials);
          const { access_token, refresh_token } = response.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          // Fetch user profile
          const userResponse = await apiClient.get("/auth/me", {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ detail: string }>;
          const message =
            axiosError.response?.data?.detail || "Login failed. Please try again.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post("/auth/register", data);
          const { access_token, refresh_token } = response.data;

          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);

          // Fetch user profile
          const userResponse = await apiClient.get("/auth/me", {
            headers: { Authorization: `Bearer ${access_token}` },
          });

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            user: userResponse.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const axiosError = error as AxiosError<{ detail: string }>;
          const message =
            axiosError.response?.data?.detail || "Registration failed. Please try again.";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) throw new Error("No refresh token");

          const response = await apiClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          localStorage.setItem("access_token", access_token);
          set({ accessToken: access_token });
        } catch {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "dineflow-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

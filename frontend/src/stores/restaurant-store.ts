import { create } from "zustand";
import { apiClient } from "@/lib/api-client";
import { Restaurant } from "@/types/restaurant";

interface RestaurantState {
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  fetchRestaurant: () => Promise<void>;
  updateRestaurant: (data: Partial<Restaurant>) => Promise<void>;
  uploadLogo: (file: File) => Promise<void>;
  deleteLogo: () => Promise<void>;
  clearError: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurant: null,
  isLoading: false,
  error: null,

  fetchRestaurant: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Restaurant>("/restaurant");
      set({ restaurant: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch restaurant profile",
        isLoading: false,
      });
    }
  },

  updateRestaurant: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Restaurant>("/restaurant", data);
      set({ restaurant: response.data, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to update restaurant profile";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  uploadLogo: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<Restaurant>("/restaurant/logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ restaurant: response.data, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to upload logo";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  deleteLogo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete<Restaurant>("/restaurant/logo");
      set({ restaurant: response.data, isLoading: false });
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to delete logo";
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  clearError: () => set({ error: null }),
}));

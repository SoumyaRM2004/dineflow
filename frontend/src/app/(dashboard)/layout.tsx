"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth(true);
  const { fetchRestaurant, restaurant, error, clearError } = useRestaurantStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRestaurant();
    }
  }, [isAuthenticated, fetchRestaurant]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 animate-spin flex items-center justify-center font-bold text-slate-950">
            DF
          </div>
          <p className="text-sm font-medium animate-pulse font-mono">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center backdrop-blur-xl">
          <h2 className="text-xl font-bold text-red-450 mb-2">Workspace Load Error</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              clearError();
              fetchRestaurant();
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-400 animate-pulse font-mono">Loading restaurant profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main dashboard content container */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header navigation */}
        <Header />

        {/* Dashboard main contents */}
        <main className="flex-1 overflow-y-auto bg-slate-950/20 px-8 py-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

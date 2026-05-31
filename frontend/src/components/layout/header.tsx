"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { Bell, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { restaurant } = useRestaurantStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between h-16 px-8 bg-slate-950/40 backdrop-blur-xl border-b border-slate-800/40 text-slate-200">
      {/* Active Restaurant Name */}
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold tracking-wide bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
          {restaurant?.name || "Loading..."}
        </h1>
        {restaurant?.slug && (
          <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800/60 text-slate-400 border border-slate-700/50">
            /{restaurant.slug}
          </span>
        )}
      </div>

      {/* Action utilities */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-900/60 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-900/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-none">
                {user?.full_name}
              </p>
              <p className="text-[10px] text-slate-500 leading-none mt-1 uppercase font-semibold tracking-wider">
                {user?.role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close on click outside */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

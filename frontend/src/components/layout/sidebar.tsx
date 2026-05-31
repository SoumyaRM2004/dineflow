"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Grid,
  Utensils,
  ClipboardList,
  ChefHat,
  Receipt,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "Restaurant Profile", href: "/restaurant", icon: Store },
    { name: "Tables", href: "/tables", icon: Grid },
    { name: "Menu Management", href: "/menu", icon: Utensils },
    { name: "Orders", href: "/orders", icon: ClipboardList },
    { name: "Kitchen Feed", href: "/kitchen", icon: ChefHat },
    { name: "Billing", href: "/billing", icon: Receipt },
    { name: "Staff Management", href: "/staff", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col w-64 h-full bg-slate-950/70 backdrop-blur-xl border-r border-slate-800/50 text-slate-200 transition-all duration-300",
        className
      )}
    >
      {/* Brand logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/50">
        <Link href="/overview" className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950">
            DF
          </span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            DineFlow
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-3.5"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 pl-4"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 mr-3 transition-colors duration-200",
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
              {!isActive && (
                <div className="absolute inset-y-0 left-0 w-0.5 bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Meta info */}
      <div className="p-4 border-t border-slate-800/50 text-center">
        <span className="text-xs text-slate-500 font-mono">v0.1.0 (Beta)</span>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useRestaurantStore } from "@/stores/restaurant-store";
import {
  TrendingUp,
  Table,
  ChefHat,
  QrCode,
  DollarSign,
  ArrowRight,
  ClipboardList,
  Utensils,
  Clock,
} from "lucide-react";

export default function OverviewPage() {
  const { user } = useAuthStore();
  const { restaurant } = useRestaurantStore();

  const stats = [
    {
      title: "Today's Revenue",
      value: `${restaurant?.currency === "INR" ? "₹" : "$"}0.00`,
      change: "+0% from yesterday",
      icon: DollarSign,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Active Sessions",
      value: "0",
      change: "Active tables dining now",
      icon: Table,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      title: "Active Orders",
      value: "0",
      change: "In preparation in kitchen",
      icon: ChefHat,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "Table Occupancy",
      value: "0%",
      change: "0 of 10 tables active",
      icon: Clock,
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
  ];

  const quickActions = [
    {
      title: "Configure Menu",
      desc: "Add categories, items, and modifiers",
      href: "/menu",
      icon: Utensils,
      btnColor: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
    },
    {
      title: "Manage Tables",
      desc: "Assign table layouts and seat counts",
      href: "/tables",
      icon: Table,
      btnColor: "bg-slate-800 hover:bg-slate-700 text-slate-100",
    },
    {
      title: "Scan & Print QRs",
      desc: "Generate QR codes for table ordering",
      href: "/qr-codes",
      icon: QrCode,
      btnColor: "bg-slate-800 hover:bg-slate-700 text-slate-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100">
            Welcome back, {user?.full_name.split(" ")[0]}!
          </h2>
          <p className="text-slate-400 mt-1">
            Here's what's happening at <span className="font-semibold text-emerald-400">{restaurant?.name}</span> today.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl text-sm text-slate-400">
          <TrendingUp className="w-4 h-4 text-emerald-400 mr-2 animate-bounce" />
          <span>SaaS Plan: <span className="font-semibold text-emerald-400 uppercase">Trial</span></span>
        </div>
      </div>

      {/* Grid statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border backdrop-blur-xl shadow-xl flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-80">{stat.title}</span>
                <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-850">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                <p className="text-xs mt-1 opacity-70">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left two columns: Quick Actions & Live feed placeholders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Quick Configuration Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-slate-950/50 border border-slate-850 flex flex-col justify-between items-start space-y-4 hover:border-slate-750 transition-colors"
                  >
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-semibold text-slate-200">{action.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">{action.desc}</p>
                    </div>
                    <Link
                      href={action.href}
                      className={`inline-flex items-center justify-center w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${action.btnColor}`}
                    >
                      Configure
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed placeholder */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-200">Recent Kitchen Orders</h3>
              <Link href="/orders" className="text-xs text-emerald-400 hover:underline flex items-center">
                View all orders <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-slate-950/20 border border-dashed border-slate-800">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4 animate-pulse">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">No active orders yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                Once customers scan their QR codes and place orders, they will show up here in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Restaurant Info quick card */}
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-200">Restaurant Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-sm text-slate-400">TimeZone</span>
                <span className="text-sm font-medium text-slate-200">{restaurant?.timezone}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-sm text-slate-400">Currency</span>
                <span className="text-sm font-medium text-slate-200 font-mono">{restaurant?.currency}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
                <span className="text-sm text-slate-400">Tax Identity</span>
                <span className="text-sm font-medium text-slate-200">
                  {restaurant?.tax_details && typeof restaurant.tax_details === 'object' && 'gstin' in restaurant.tax_details
                    ? String((restaurant.tax_details as any).gstin)
                    : "Not configured"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-slate-400">Owner Contact</span>
                <span className="text-sm font-medium text-slate-200 truncate max-w-[150px]">
                  {restaurant?.email || "None"}
                </span>
              </div>
            </div>
            <Link
              href="/restaurant"
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-sm font-medium text-slate-200 hover:text-emerald-400 transition-all duration-200"
            >
              Update Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

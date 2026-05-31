"use client";

import { useEffect, useState, useRef } from "react";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { Upload, X, Save, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";

export default function RestaurantProfilePage() {
  const {
    restaurant,
    isLoading,
    error,
    updateRestaurant,
    uploadLogo,
    deleteLogo,
    clearError,
  } = useRestaurantStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currency, setCurrency] = useState("INR");
  const [gstin, setGstin] = useState("");
  const [taxRate, setTaxRate] = useState("18");

  // Sync state with store on load
  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setPhone(restaurant.phone || "");
      setEmail(restaurant.email || "");
      setAddress(restaurant.address || "");
      setTimezone(restaurant.timezone || "Asia/Kolkata");
      setCurrency(restaurant.currency || "INR");

      // Handle tax details
      const tax = restaurant.tax_details as any;
      if (tax) {
        setGstin(tax.gstin || "");
        setTaxRate(tax.tax_rate !== undefined ? String(tax.tax_rate) : "18");
      }
    }
  }, [restaurant]);

  // Clear notifications on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

    const tax_details = {
      gstin: gstin.trim(),
      tax_rate: parseFloat(taxRate) || 0,
    };

    try {
      await updateRestaurant({
        name,
        phone,
        email,
        address,
        timezone,
        currency,
        tax_details,
      });
      triggerSuccess("Restaurant profile updated successfully!");
    } catch (err) {
      // Handled by store error
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG/JPG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }

    clearError();
    setSuccessMessage(null);
    try {
      await uploadLogo(file);
      triggerSuccess("Logo uploaded successfully!");
    } catch (err) {
      // Handled by store
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;

    clearError();
    setSuccessMessage(null);
    try {
      await deleteLogo();
      triggerSuccess("Logo removed successfully.");
    } catch (err) {
      // Handled by store
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    clearError();
    setSuccessMessage(null);
    try {
      await uploadLogo(file);
      triggerSuccess("Logo uploaded successfully!");
    } catch (err) {
      // Handled by store
    }
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const getFullLogoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Restaurant Settings</h2>
        <p className="text-slate-400 mt-1">Configure your brand details, contact info, and tax identity.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Logo Drag and Drop */}
        <div className="md:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Brand Logo</h3>

            {restaurant?.logo_url ? (
              <div className="relative group w-40 h-40 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFullLogoUrl(restaurant.logo_url) || ""}
                  alt="Restaurant Logo"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                  <button
                    onClick={handleLogoDelete}
                    disabled={isLoading}
                    className="p-2.5 rounded-full bg-red-500 hover:bg-red-600 text-slate-100 transition-colors"
                    title="Remove Logo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 hover:bg-slate-950/60 hover:border-emerald-500/50 cursor-pointer flex flex-col items-center justify-center p-4 transition-all duration-200"
              >
                <div className="p-3 rounded-full bg-slate-900 text-slate-500 mb-2">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-xs text-slate-400 font-medium">Upload Image</span>
                <span className="text-[10px] text-slate-500 mt-1">Drag & drop / click</span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />

            <p className="text-[10px] text-slate-500 mt-4 leading-normal">
              Recommended: Square size (JPEG/PNG), Max 2MB.
            </p>
          </div>
        </div>

        {/* Right Columns: Profile Form */}
        <form onSubmit={handleUpdateProfile} className="md:col-span-2 space-y-6">
          {/* Card: Core Contact Info */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-lg font-semibold text-slate-200">Contact Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all"
                  placeholder="e.g. Golden Diner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Primary Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all"
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Public Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all"
                  placeholder="e.g. contact@goldendiner.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Address</label>
                <textarea
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all resize-none"
                  placeholder="Street name, City, Zipcode..."
                />
              </div>
            </div>
          </div>

          {/* Card: Localization Details */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-lg font-semibold text-slate-200">Localization</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 text-slate-200 outline-none text-sm transition-all"
                >
                  <option value="INR">INR (₹) Indian Rupee</option>
                  <option value="USD">USD ($) US Dollar</option>
                  <option value="EUR">EUR (€) Euro</option>
                  <option value="GBP">GBP (£) British Pound</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 text-slate-200 outline-none text-sm transition-all"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC">UTC (GMT+0:00)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card: Tax details */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-lg font-semibold text-slate-200">Tax Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">GSTIN / Tax ID</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all uppercase"
                  placeholder="e.g. 27AAAAA1111A1Z1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-850 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-200 outline-none text-sm transition-all"
                  placeholder="e.g. 18"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 font-semibold transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saving Changes..." : "Save Configuration"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

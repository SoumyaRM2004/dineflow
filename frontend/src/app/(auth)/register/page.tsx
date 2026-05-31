"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/constants";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (password !== confirmPassword) return;
    if (!agreeTerms) return;

    try {
      await register({
        full_name: fullName,
        restaurant_name: restaurantName,
        email,
        password,
      });
      router.push(ROUTES.DASHBOARD);
    } catch {
      // Error is set in store
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Create your account
        </h2>
        <p className="text-slate-400">
          Get your restaurant online in minutes
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="reg-name" className="text-sm font-medium text-slate-300">
            Full Name
          </label>
          <input
            id="reg-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            minLength={2}
            className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
          />
        </div>

        {/* Restaurant Name */}
        <div className="space-y-2">
          <label htmlFor="reg-restaurant" className="text-sm font-medium text-slate-300">
            Restaurant Name
          </label>
          <input
            id="reg-restaurant"
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            placeholder="My Restaurant"
            required
            minLength={2}
            className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="reg-email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@restaurant.com"
            required
            className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="reg-password" className="text-sm font-medium text-slate-300">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Strength indicator */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                  style={{ width: `${(strength.score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-12">{strength.label}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-300">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              required
              className={`w-full h-12 px-4 pr-12 rounded-xl bg-white/[0.05] border text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? "border-emerald-500/30 focus:ring-emerald-500/40"
                    : "border-red-500/30 focus:ring-red-500/40"
                  : "border-white/[0.08] focus:ring-emerald-500/40"
              }`}
            />
            {passwordsMatch && (
              <Check
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 animate-in fade-in duration-200"
              />
            )}
          </div>
        </div>

        {/* Terms */}
        <label
          htmlFor="reg-terms"
          className="flex items-start gap-3 py-2 cursor-pointer group"
        >
          <input
            id="reg-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            I agree to the{" "}
            <span className="text-emerald-400 hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-emerald-400 hover:underline">
              Privacy Policy
            </span>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !agreeTerms || !passwordsMatch}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Login link */}
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

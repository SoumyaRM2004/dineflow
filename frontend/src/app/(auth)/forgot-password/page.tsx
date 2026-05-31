"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import apiClient from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={28} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">Check your email</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          If an account with <span className="text-white font-medium">{email}</span> exists,
          we&apos;ve sent a password reset link.
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back link */}
      <Link
        href={ROUTES.LOGIN}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Reset your password
        </h2>
        <p className="text-slate-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="reset-email" className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@restaurant.com"
            required
            className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </span>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </div>
  );
}

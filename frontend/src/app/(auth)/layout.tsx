import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DineFlow — Authentication",
  description: "Sign in to your DineFlow restaurant dashboard",
};

const features = [
  { icon: "📱", title: "QR Ordering", desc: "Scan & order instantly" },
  { icon: "👨‍🍳", title: "Kitchen Display", desc: "Real-time order queue" },
  { icon: "💳", title: "Smart Billing", desc: "Auto bill generation" },
  { icon: "📊", title: "Analytics", desc: "Data-driven insights" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Radial glow effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />

        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo & tagline */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-3xl font-bold text-white">D</span>
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                DineFlow
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              The Modern Restaurant
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Operating System
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              QR-based ordering, kitchen management, billing, and analytics —
              all without expensive POS hardware.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.08] hover:border-emerald-500/20 transition-all duration-300 group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </span>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-300"
                >
                  {["A", "B", "C", "D"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Trusted by <span className="text-emerald-400 font-medium">500+</span> restaurants
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-slate-950">
        {/* Mobile logo (shown only on mobile) */}
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-xl font-bold text-white">D</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              DineFlow
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

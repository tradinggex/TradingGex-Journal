import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  TrendingUp,
  BarChart3,
  BookOpen,
  Brain,
  Globe,
  Check,
  ChevronRight,
  Star,
  Shield,
  Zap,
} from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-[#e2e8f0] font-sans">

      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d0f1a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex flex-col leading-none shrink-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-white">
              TradingG<span className="text-purple-400">ex</span>
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase text-[#64748b] mt-0.5">
              Journal
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[#94a3b8]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-[#94a3b8] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] bg-purple-600/10 rounded-full blur-[100px] sm:blur-[120px]" />
          <div className="absolute top-40 left-1/3 w-[300px] sm:w-[400px] h-[200px] sm:h-[300px] bg-purple-800/8 rounded-full blur-[80px] sm:blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-5 sm:mb-6">
            Track. Analyze.<br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
              Trade Like a Pro.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0">
            The professional trading journal built for serious ICT traders.
            Log trades, analyze your patterns, and build the
            discipline to achieve consistent profitability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12 sm:mb-16 px-4 sm:px-0">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-base px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ChevronRight size={18} />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/20 font-medium text-base px-8 py-3.5 rounded-2xl transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-[#64748b]">
            {[
              { value: "3-day", label: "free trial" },
              { value: "$19.99", label: "per month" },
              { value: "EN / ES / PT", label: "languages" },
            ].map(({ value, label }) => (
              <div key={value} className="text-center">
                <div className="text-lg sm:text-xl font-bold text-white mb-0.5">{value}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* App preview card */}
        <div className="relative max-w-5xl mx-auto mt-12 sm:mt-16 px-0 sm:px-4">
          <div className="rounded-xl sm:rounded-2xl border border-white/5 bg-[#141725] p-0.5 sm:p-1 shadow-2xl shadow-black/60">
            <div className="rounded-lg sm:rounded-xl bg-[#0d0f1a] border border-white/5 p-4 sm:p-6">
              {/* Fake dashboard preview */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/5">
                <div className="text-sm sm:text-base font-black text-white">
                  TradingG<span className="text-purple-400">ex</span>
                </div>
                <div className="flex gap-1 sm:gap-2 ml-auto">
                  {["Dashboard", "Trades", "Analytics", "Journal"].map((item) => (
                    <div key={item} className="hidden sm:block text-[11px] text-[#64748b] px-2 sm:px-3 py-1 rounded-lg">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {[
                  { label: "Net P&L", value: "+$4,284", color: "text-emerald-400" },
                  { label: "Win Rate", value: "64.2%", color: "text-white" },
                  { label: "Profit Factor", value: "2.18", color: "text-white" },
                  { label: "Avg R", value: "1.4R", color: "text-purple-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#1c2035] rounded-lg sm:rounded-xl p-2.5 sm:p-4">
                    <div className="text-[9px] sm:text-[10px] text-[#64748b] uppercase tracking-widest mb-1">{label}</div>
                    <div className={`text-base sm:text-xl font-bold ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
              {/* Fake chart bars */}
              <div className="bg-[#1c2035] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-end gap-0.5 sm:gap-1 h-16 sm:h-24">
                {[40, 55, 35, 70, 45, 80, 60, 75, 50, 85, 65, 90, 55, 72, 48, 68, 82, 95, 70, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: h > 70
                        ? "rgba(168, 85, 247, 0.7)"
                        : h > 50
                        ? "rgba(168, 85, 247, 0.35)"
                        : "rgba(100, 116, 139, 0.2)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-purple-600/20 blur-2xl rounded-full" />
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
              Everything a serious trader needs
            </h2>
            <p className="text-[#94a3b8] max-w-xl mx-auto text-sm sm:text-base">
              Built specifically for ICT traders — every feature maps to how you actually think about the market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                icon: TrendingUp,
                title: "Trade Tracking",
                desc: "Log every trade with full detail — entry/exit, R multiple, emotional state, screenshots, and written notes.",
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Equity curve, drawdown chart, R distribution, monthly P&L heatmap, and performance breakdown by setup.",
                color: "text-blue-400",
                bg: "bg-blue-400/10",
              },
              {
                icon: BookOpen,
                title: "Trading Journal",
                desc: "Document each session with market conditions, discipline scores, emotions, lessons learned, and gratitude practice.",
                color: "text-amber-400",
                bg: "bg-amber-400/10",
              },
              {
                icon: Brain,
                title: "Emotional Intelligence",
                desc: "Track how FOMO, revenge trading, anxiety, and overconfidence impact your P&L — with hard data.",
                color: "text-pink-400",
                bg: "bg-pink-400/10",
              },
              {
                icon: Globe,
                title: "Multi-language",
                desc: "Full support for English, Spanish, and Portuguese. Switch instantly from the settings panel.",
                color: "text-cyan-400",
                bg: "bg-cyan-400/10",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/5 bg-[#141725] p-5 sm:p-6 hover:border-purple-500/25 transition-all hover:shadow-lg hover:shadow-purple-500/5"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center mb-3 sm:mb-4`}>
                  <Icon size={18} className={color} />
                </div>
                <h3 className="font-bold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust badges ─── */}
      <section className="py-8 sm:py-10 px-4 border-y border-white/5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-[#64748b]">
          {[
            { icon: Shield, text: "Secure & encrypted" },
            { icon: Zap, text: "Real-time analytics" },
            { icon: Globe, text: "Works in 3 languages" },
            { icon: Zap, text: "Always improving" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-purple-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-[#94a3b8] text-sm sm:text-base">Start free. No credit card required to begin your trial.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-stretch justify-center max-w-2xl md:max-w-none mx-auto">
            {/* Free trial card */}
            <div className="flex-1 md:max-w-sm rounded-2xl border border-white/10 bg-[#141725] p-6 sm:p-8">
              <div className="text-sm font-semibold text-[#94a3b8] mb-1">Free Trial</div>
              <div className="text-4xl font-black text-white mb-1">$0</div>
              <div className="text-sm text-[#64748b] mb-5 sm:mb-6">3 days, no credit card needed</div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  "Unlimited trade logging",
                  "Advanced analytics dashboard",
                  "Daily trading journal",
                  "Screenshot uploads",
                  "Multi-language support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
                    <div className="w-4 h-4 rounded-full bg-[#1c2035] border border-white/10 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-[#64748b]" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center border border-white/10 hover:border-white/20 text-white font-semibold text-sm py-3 rounded-xl transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro card */}
            <div className="flex-1 md:max-w-sm relative rounded-2xl border border-purple-500/40 bg-gradient-to-b from-purple-500/10 to-[#141725] p-6 sm:p-8 shadow-xl shadow-purple-500/10 mt-4 md:mt-0">
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                MOST POPULAR
              </div>
              <div className="text-sm font-semibold text-purple-300 mb-1">Pro</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">$19.99</span>
                <span className="text-[#64748b] mb-1">/month</span>
              </div>
              <div className="text-sm text-[#64748b] mb-5 sm:mb-6">Everything in trial, plus</div>
              <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                {[
                  "Everything in Free Trial",
                  "Unlimited trade history",
                  "Priority support",
                  "New features first",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#e2e8f0]">
                    <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-purple-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-purple-500/30"
              >
                Start 3-Day Free Trial →
              </Link>
              <p className="text-center text-[11px] text-[#64748b] mt-3">
                Cancel anytime. No commitment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-3">Testimonials</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4">
              What traders are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                name: "Marcus T.",
                role: "Futures Trader · CME",
                avatar: "MT",
                quote: "The analytics dashboard is the most honest feedback I've ever gotten on my trading. Seeing my revenge trading pattern laid out in cold data — something I never noticed just reading my journal entries.",
                stars: 5,
              },
              {
                name: "Alejandro R.",
                role: "ICT Trader · Crypto Futures",
                avatar: "AR",
                quote: "I went from 38% win rate to 57% in two months. The emotional tracking showed me I was taking 80% of my losses while feeling FOMO. That one insight was worth 10x the subscription.",
                stars: 5,
              },
              {
                name: "Priya M.",
                role: "Day Trader · Forex Futures",
                avatar: "PM",
                quote: "Finally a journal built by someone who actually trades. The R-multiple tracking and setup breakdown by performance changed how I approach my A+ setups every week.",
                stars: 5,
              },
            ].map(({ name, role, avatar, quote, stars }) => (
              <div key={name} className="rounded-2xl border border-white/5 bg-[#141725] p-5 sm:p-6">
                <div className="flex gap-0.5 mb-3 sm:mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 sm:mb-5">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-[#64748b]">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-2xl sm:rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-transparent p-8 sm:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-purple-600/5 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                Ready to trade with<br />
                <span className="text-purple-400">purpose and clarity?</span>
              </h2>
              <p className="text-[#94a3b8] mb-7 sm:mb-8 text-sm sm:text-base">
                Join traders who use TradingGex Journal to track their edge,
                control their emotions, and compound their results.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Start Your Free Trial
                <ChevronRight size={18} />
              </Link>
              <p className="text-xs text-[#64748b] mt-4">3 days free · No credit card · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col leading-none">
            <span className="text-base font-black text-white">
              TradingG<span className="text-purple-400">ex</span>
              <span className="text-[#64748b] font-normal text-sm ml-2">Journal</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#64748b]">
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
          <div className="text-xs text-[#64748b]">
            © {new Date().getFullYear()} TradingGex. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LayoutDashboard, TrendingUp, BarChart3, BookOpen, Settings2, CreditCard, Sparkles } from "lucide-react";

interface TopNavProps {
  userEmail?: string;
  userName?: string;
  trialDaysLeft?: number;
  subscriptionStatus?: string | null;
}

export function TopNav({ userEmail, userName, trialDaysLeft, subscriptionStatus }: TopNavProps) {
  const t = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const NAV_ICONS = {
    "/dashboard": LayoutDashboard,
    "/trades":    TrendingUp,
    "/analytics": BarChart3,
    "/mentor":    Sparkles,
    "/journal":   BookOpen,
    "/settings":  Settings2,
  };

  const navItems = [
    { href: "/dashboard",  label: t("nav.dashboard") },
    { href: "/trades",     label: t("nav.trades") },
    { href: "/analytics",  label: t("nav.analytics") },
    { href: "/mentor",     label: t("nav.mentor") },
    { href: "/journal",    label: t("nav.journal") },
    { href: "/settings",   label: t("nav.settings") },
  ];

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "TG";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="h-full px-4 sm:px-6 flex items-center gap-3 sm:gap-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex flex-col leading-none">
            <span className="text-base font-black tracking-tight text-foreground">
              TradingG<span className="text-purple-500">ex</span>
            </span>
            <span className="text-[9px] tracking-[0.18em] uppercase text-fg-subtle mt-0.5">
              Journal
            </span>
          </Link>

          {/* Vertical divider — desktop only */}
          <div className="hidden md:block h-6 w-px bg-surface3 shrink-0" />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative px-3.5 py-2 text-sm font-medium rounded-xl transition-all",
                    active
                      ? "text-purple-500 dark:text-purple-400"
                      : "text-fg-muted hover:text-foreground hover:bg-surface2"
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-purple-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            {/* Trial countdown badge */}
            {trialDaysLeft !== undefined && (
              <Link
                href="/billing"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-400 text-xs font-semibold hover:bg-amber-400/15 transition-colors"
              >
                {trialDaysLeft === 0 ? "Prueba: último día" : `Prueba: ${trialDaysLeft}d`}
              </Link>
            )}
            {/* Billing link for active subscribers */}
            {subscriptionStatus === "active" && (
              <Link
                href="/billing"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 text-[11px] font-semibold hover:bg-emerald-400/15 transition-colors"
              >
                Pro
              </Link>
            )}
            <ThemeToggle />

            {/* New Trade — hidden on smallest screens */}
            <Link
              href="/trades/new"
              className="hidden sm:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold transition-colors"
            >
              <span className="text-sm leading-none">+</span>
              <span className="hidden sm:inline">{t("topbar.newTradeBtn")}</span>
            </Link>

            {/* User section — desktop only */}
            <div
              className="hidden md:flex items-center gap-2.5 pl-2 ml-1"
              style={{ borderLeft: "1px solid var(--border)" }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="hidden lg:block min-w-0 max-w-[120px]">
                {userName && (
                  <div className="text-xs font-semibold text-foreground truncate">{userName}</div>
                )}
                {userEmail && (
                  <div className="text-[10px] text-fg-subtle truncate">{userEmail}</div>
                )}
              </div>
              <button
                type="button"
                onClick={async () => { await logout(); router.push("/login"); }}
                className="text-[11px] text-fg-subtle hover:text-red-500 transition-colors px-1"
                title="Sign out"
              >
                {t("nav.logout")}
              </button>
            </div>

            {/* Hamburger — mobile only */}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg text-fg-muted hover:text-foreground hover:bg-surface2 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex pt-16">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div
            className="relative flex flex-col w-72 max-w-[85vw] h-full bg-surface"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            {/* Nav links */}
            <nav className="flex-1 p-4 pt-6 space-y-1 overflow-y-auto">
              {navItems.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                const Icon = NAV_ICONS[href as keyof typeof NAV_ICONS];
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      active
                        ? "text-purple-400 bg-purple-500/10"
                        : "text-fg-muted hover:text-foreground hover:bg-surface2"
                    )}
                  >
                    <Icon size={15} strokeWidth={active ? 2 : 1.75} className="shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Billing / trial link in mobile drawer */}
            {(trialDaysLeft !== undefined || subscriptionStatus === "active") && (
              <div className="px-4 pb-2">
                <Link
                  href="/billing"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-all"
                >
                  <CreditCard size={15} strokeWidth={1.75} className="shrink-0" />
                  {subscriptionStatus === "active" ? "Facturación (Pro)" : `Prueba gratuita — ${trialDaysLeft}d restante${trialDaysLeft !== 1 ? "s" : ""}`}
                </Link>
              </div>
            )}

            {/* Footer: New Trade + user */}
            <div className="p-4 space-y-4" style={{ borderTop: "1px solid var(--border)" }}>
              <Link
                href="/trades/new"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold transition-colors"
              >
                <span>+</span>
                {t("topbar.newTradeBtn")}
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  {userName && (
                    <div className="text-sm font-semibold text-foreground truncate">{userName}</div>
                  )}
                  {userEmail && (
                    <div className="text-xs text-fg-subtle truncate">{userEmail}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => { await logout(); router.push("/login"); }}
                  className="text-xs text-fg-subtle hover:text-red-500 transition-colors px-1 py-1"
                >
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface TopNavProps {
  userEmail?: string;
  userName?: string;
}


export function TopNav({ userEmail, userName }: TopNavProps) {
  const t = useTranslation();
  const pathname = usePathname();

  const navItems = [
    { href: "/",          label: t("nav.dashboard") },
    { href: "/trades",    label: t("nav.trades")    },
    { href: "/analytics", label: t("nav.analytics") },
    { href: "/journal",   label: t("nav.journal")   },
    { href: "/settings",  label: t("nav.settings")  },
  ];

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "TG";

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 z-50 bg-surface"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="h-full px-6 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex flex-col leading-none mr-2">
          <span className="text-base font-black tracking-tight text-foreground">
            TradingG<span className="text-purple-500">ex</span>
          </span>
          <span className="text-[9px] tracking-[0.18em] uppercase text-fg-subtle mt-0.5">
            Journal
          </span>
        </Link>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-surface3 shrink-0" />

        {/* Nav items */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
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
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <Link
            href="/trades/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold transition-colors"
          >
            <span className="text-sm leading-none">+</span>
            <span>{t("topbar.newTradeBtn")}</span>
          </Link>

          {/* User section */}
          <div
            className="flex items-center gap-2.5 pl-2 ml-1"
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
            <form action={logout}>
              <button
                type="submit"
                className="text-[11px] text-fg-subtle hover:text-red-500 transition-colors px-1"
                title="Sign out"
              >
                {t("nav.logout")}
              </button>
            </form>
          </div>
        </div>

      </div>
    </header>
  );
}

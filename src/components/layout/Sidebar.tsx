"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/context";

interface SidebarProps {
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  const t = useTranslation();
  const pathname = usePathname();
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "TG";

  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: "📊" },
    { href: "/trades", label: t("nav.trades"), icon: "📋" },
    { href: "/analytics", label: t("nav.analytics"), icon: "📈" },
    { href: "/journal", label: t("nav.journal"), icon: "📓" },
    { href: "/settings", label: t("nav.settings"), icon: "⚙️" },
  ];

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-56 bg-surface flex flex-col z-50"
      style={{ boxShadow: "var(--sidebar-shadow)" }}
    >
      {/* Logo */}
      <div className="px-6 py-7">
        <div className="text-lg font-black tracking-tight text-foreground">
          TradingG<span className="text-purple-500">ex</span>
        </div>
        <div className="text-[10px] text-fg-subtle tracking-widest uppercase mt-0.5">
          Trading Journal
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                active
                  ? "text-purple-500 dark:text-purple-400 bg-purple-500/10"
                  : "text-fg-muted hover:text-foreground hover:bg-surface2"
              )}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: user info + sign out */}
      <div className="p-3 mb-2">
        <div className="bg-surface2 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              {userName && (
                <div className="text-xs font-semibold text-foreground truncate">{userName}</div>
              )}
              {userEmail && (
                <div className="text-[10px] text-fg-subtle truncate">{userEmail}</div>
              )}
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left text-xs text-fg-subtle hover:text-red-500 transition-colors"
            >
              {t("nav.logout")}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

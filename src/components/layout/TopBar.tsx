"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function TopBar() {
  const t = useTranslation();
  const pathname = usePathname();

  function getPage(): { title: string; subtitle: string } {
    const map: Record<string, { title: string; subtitle: string }> = {
      "/": { title: t("topbar.dashboard"), subtitle: t("topbar.dashboardSub") },
      "/trades": { title: t("topbar.trades"), subtitle: t("topbar.tradesSub") },
      "/trades/new": { title: t("topbar.newTrade"), subtitle: t("topbar.newTradeSub") },
      "/analytics": { title: t("topbar.analytics"), subtitle: t("topbar.analyticsSub") },
      "/journal": { title: t("topbar.journal"), subtitle: t("topbar.journalSub") },
      "/journal/new": { title: t("topbar.newJournal"), subtitle: t("topbar.newJournalSub") },
      "/settings": { title: t("topbar.settings"), subtitle: t("topbar.settingsSub") },
    };

    if (map[pathname]) return map[pathname];
    if (pathname.startsWith("/trades/") && pathname.endsWith("/edit"))
      return { title: t("topbar.editTrade"), subtitle: t("topbar.editTradeSub") };
    if (pathname.startsWith("/trades/"))
      return { title: t("topbar.tradeDetail"), subtitle: t("topbar.tradeDetailSub") };
    if (pathname.startsWith("/journal/"))
      return { title: t("topbar.journalDetail"), subtitle: t("topbar.journalDetailSub") };
    return { title: "TradingGex Journal", subtitle: "" };
  }

  const page = getPage();

  return (
    <header className="h-14 flex items-center justify-between px-6" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <h1 className="text-base font-bold text-slate-100">
          {page.title}
          {page.subtitle && (
            <span className="text-purple-500 ml-1.5">{page.subtitle}</span>
          )}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/trades/new"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-purple-400 transition-colors"
        >
          <span>+</span>
          <span>{t("topbar.newTradeBtn")}</span>
        </Link>
      </div>
    </header>
  );
}

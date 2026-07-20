import { requireUser } from "@/lib/session";
import { getDictionary, getLocale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import { TopNav } from "@/components/layout/TopNav";
import { getUserSubscription, hasAccess, trialDaysLeft } from "@/lib/subscription";
import { PaywallScreen } from "@/components/billing/PaywallScreen";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const cookieStore = await cookies();
  const activeAccountId = cookieStore.get("activeAccount")?.value ?? null;

  const [dict, locale, sub, accountsRes] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserSubscription(user.userId),
    supabase
      .from("FundedAccount")
      .select("id, firmName, accountType")
      .eq("userId", user.userId)
      .order("createdAt", { ascending: true }),
  ]);

  const accounts = accountsRes.data ?? [];

  const daysLeft = trialDaysLeft(sub);
  const access = hasAccess(sub);

  return (
    <I18nProvider dict={dict} locale={locale}>
      <TopNav
        userEmail={user.email}
        userName={user.name ?? undefined}
        trialDaysLeft={sub.subscriptionStatus === "trialing" && access ? daysLeft : undefined}
        subscriptionStatus={sub.subscriptionStatus}
        accounts={accounts}
        activeAccountId={activeAccountId}
      />
      <main className="pt-16 min-h-screen">
        {access ? (
          <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-6">
            {children}
          </div>
        ) : (
          <PaywallScreen
            subscriptionStatus={sub.subscriptionStatus}
            trialEndsAt={sub.trialEndsAt}
            userEmail={user.email}
          />
        )}
      </main>
    </I18nProvider>
  );
}

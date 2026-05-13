import { requireUser } from "@/lib/session";
import { getDictionary, getLocale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import { TopNav } from "@/components/layout/TopNav";
import { getUserSubscription, hasAccess, trialDaysLeft } from "@/lib/subscription";
import { PaywallScreen } from "@/components/billing/PaywallScreen";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [dict, locale, sub] = await Promise.all([
    getDictionary(),
    getLocale(),
    getUserSubscription(user.userId),
  ]);

  const daysLeft = trialDaysLeft(sub);
  const access = hasAccess(sub);

  return (
    <I18nProvider dict={dict} locale={locale}>
      <TopNav
        userEmail={user.email}
        userName={user.name ?? undefined}
        trialDaysLeft={sub.subscriptionStatus === "trialing" && access ? daysLeft : undefined}
        subscriptionStatus={sub.subscriptionStatus}
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

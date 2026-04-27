import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import { TopNav } from "@/components/layout/TopNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const dict = await getDictionary();

  return (
    <I18nProvider dict={dict}>
      <TopNav userEmail={user.email} userName={user.name ?? undefined} />
      <main className="pt-16 min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-6">
          {children}
        </div>
      </main>
    </I18nProvider>
  );
}

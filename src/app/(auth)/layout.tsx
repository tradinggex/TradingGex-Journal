import { getDictionary, getLocale } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthLangSwitcher } from "@/components/auth/AuthLangSwitcher";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <I18nProvider dict={dict} locale={locale}>
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AuthLangSwitcher />
        {children}
      </div>
    </I18nProvider>
  );
}

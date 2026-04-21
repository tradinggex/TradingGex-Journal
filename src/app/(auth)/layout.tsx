import { getDictionary } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/context";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <I18nProvider dict={dict}>
      <div className="min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
    </I18nProvider>
  );
}

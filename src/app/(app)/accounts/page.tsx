import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { AccountsView } from "@/components/accounts/AccountsView";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const user = await requireUser();
  const [accountsRes, dict] = await Promise.all([
    supabase
      .from("FundedAccount")
      .select("*")
      .eq("userId", user.userId)
      .order("createdAt", { ascending: false }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.settings.accounts.title}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.settings.accounts.subtitle}</p>
      </div>
      <AccountsView accounts={accountsRes.data ?? []} />
    </div>
  );
}

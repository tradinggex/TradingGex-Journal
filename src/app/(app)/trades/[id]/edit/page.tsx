import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { TradeForm } from "@/components/trades/TradeForm";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradePage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;

  const cookieStore = await cookies();
  const activeAccountId = cookieStore.get("activeAccount")?.value ?? null;

  const [tradeRes, instrumentsRes, setupsRes, tagsRes, accountsRes, dict] = await Promise.all([
    supabase
      .from("Trade")
      .select("*, instrument:Instrument(*), tags:TradeTag(*, tag:Tag(*)), screenshots:Screenshot(*)")
      .eq("id", id)
      .eq("userId", user.userId)
      .order("createdAt", { referencedTable: "screenshots", ascending: true })
      .maybeSingle(),
    supabase.from("Instrument").select("*").eq("isActive", true).order("symbol"),
    supabase.from("Setup").select("*").eq("userId", user.userId).eq("isActive", true).order("name"),
    supabase.from("Tag").select("*").order("name"),
    supabase.from("FundedAccount").select("id, firmName, accountType").eq("userId", user.userId).order("createdAt", { ascending: true }),
    getDictionary(),
  ]);

  const trade = tradeRes.data;
  if (!trade) notFound();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { instrument, screenshots, ...tradeData } = trade;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/trades/${id}`} className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
            {dict.trades.detail.back}
          </Link>
        </div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.editTrade}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">
          {trade.instrument?.symbol ?? ""} — {dict.topbar.editTradeSub}
        </p>
      </div>
      <TradeForm
        instruments={instrumentsRes.data ?? []}
        setups={setupsRes.data ?? []}
        tags={tagsRes.data ?? []}
        accounts={accountsRes.data ?? []}
        defaultAccountId={activeAccountId}
        editTrade={tradeData}
        editScreenshots={screenshots ?? []}
      />
    </div>
  );
}

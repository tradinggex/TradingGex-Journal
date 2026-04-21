import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n";
import { TradeForm } from "@/components/trades/TradeForm";

export const dynamic = "force-dynamic";

export default async function NewTradePage() {
  const [instruments, setups, tags, dict] = await Promise.all([
    prisma.instrument.findMany({ where: { isActive: true }, orderBy: { symbol: "asc" } }),
    prisma.setup.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">{dict.topbar.newTrade}</h1>
        <p className="text-sm text-slate-500 font-mono mt-0.5">{dict.topbar.newTradeSub}</p>
      </div>
      <TradeForm instruments={instruments} setups={setups} tags={tags} />
    </div>
  );
}

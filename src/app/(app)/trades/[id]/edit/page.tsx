import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { TradeForm } from "@/components/trades/TradeForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradePage({ params }: PageProps) {
  const user = await requireUser();
  const { id } = await params;

  const [trade, instruments, setups, tags, dict] = await Promise.all([
    prisma.trade.findFirst({
      where: { id, userId: user.userId },
      include: {
        tags: { include: { tag: true } },
        instrument: true,
      },
    }),
    prisma.instrument.findMany({ where: { isActive: true }, orderBy: { symbol: "asc" } }),
    prisma.setup.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getDictionary(),
  ]);

  if (!trade) notFound();

  const { instrument, ...tradeData } = trade;

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
          {instrument?.symbol ?? ""} — {dict.topbar.editTradeSub}
        </p>
      </div>
      <TradeForm
        instruments={instruments}
        setups={setups}
        tags={tags}
        editTrade={tradeData}
      />
    </div>
  );
}

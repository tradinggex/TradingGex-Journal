import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";
import { TradeTable } from "@/components/trades/TradeTable";
import { TradeFilters } from "@/components/trades/TradeFilters";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchParams {
  direction?: string;
  instrument?: string;
  setup?: string;
  status?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const PAGE_SIZE = 25;

export default async function TradesPage({ searchParams }: PageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const dict = await getDictionary();
  const d = dict.trades;

  const direction = params.direction ?? "";
  const instrumentId = params.instrument ?? "";
  const setupId = params.setup ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const where: Record<string, unknown> = { userId: user.userId };
  if (direction) where.direction = direction;
  if (instrumentId) where.instrumentId = instrumentId;
  if (setupId) where.setupId = setupId;
  if (status) where.status = status;

  const [trades, total, instruments, setups] = await Promise.all([
    prisma.trade.findMany({
      where,
      include: {
        instrument: true,
        setup: true,
        tags: { include: { tag: true } },
      },
      orderBy: { entryAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.trade.count({ where }),
    prisma.instrument.findMany({ where: { isActive: true }, orderBy: { symbol: "asc" } }),
    prisma.setup.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{d.title}</h1>
          <p className="text-sm text-fg-subtle mt-0.5">
            {d.subtitle.replace("{count}", String(total))}
          </p>
        </div>
        <Link
          href="/trades/new"
          className="bg-purple-500 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:bg-purple-400 transition-colors"
        >
          {d.newTrade}
        </Link>
      </div>

      {/* Filters */}
      <TradeFilters
        instruments={instruments}
        setups={setups}
        currentDirection={direction}
        currentInstrument={instrumentId}
        currentSetup={setupId}
        currentStatus={status}
      />

      {/* Table */}
      <TradeTable trades={trades} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2">
          {page > 1 && (
            <Link
              href={`/trades?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              {d.prevPage}
            </Link>
          )}
          <span className="text-xs font-mono text-slate-500">
            {d.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
          </span>
          {page < totalPages && (
            <Link
              href={`/trades?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              {d.nextPage}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

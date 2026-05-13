export interface ClosedTrade {
  netPnl: number;
  rMultiple: number | null;
  entryAt: Date | string;
  exitAt: Date | string | null;
  setupId: string | null;
  setup?: { name: string } | null;
  direction: string;
  instrumentId: string;
  instrument?: { symbol: string; market: string } | null;
  optionType?: string | null;
}

export function computeWinRate(trades: ClosedTrade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.netPnl > 0).length;
  return (wins / trades.length) * 100;
}

export function computeProfitFactor(trades: ClosedTrade[]): number {
  const grossWins = trades.filter((t) => t.netPnl > 0).reduce((s, t) => s + t.netPnl, 0);
  const grossLosses = Math.abs(trades.filter((t) => t.netPnl < 0).reduce((s, t) => s + t.netPnl, 0));
  if (grossLosses === 0) return grossWins > 0 ? 99.99 : 0;
  return grossWins / grossLosses;
}

export function computeMaxDrawdown(equityCurve: number[]): { amount: number; percent: number } {
  if (equityCurve.length === 0) return { amount: 0, percent: 0 };
  let peak = equityCurve[0];
  let maxDD = 0;
  let maxDDPercent = 0;
  for (const val of equityCurve) {
    if (val > peak) peak = val;
    const dd = peak - val;
    const ddPct = peak !== 0 ? (dd / Math.abs(peak)) * 100 : 0;
    if (dd > maxDD) { maxDD = dd; maxDDPercent = ddPct; }
  }
  return { amount: maxDD, percent: maxDDPercent };
}

export function computeSharpeRatio(trades: ClosedTrade[]): number {
  if (trades.length < 2) return 0;
  const pnls = trades.map((t) => t.netPnl);
  const mean = pnls.reduce((s, v) => s + v, 0) / pnls.length;
  const variance = pnls.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / pnls.length;
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (mean / stdDev) * Math.sqrt(252);
}

export function buildEquityCurve(trades: ClosedTrade[], locale = "en-US"): { index: number; cumPnl: number; date: string; pnl: number }[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.entryAt).getTime() - new Date(b.entryAt).getTime()
  );
  let cumPnl = 0;
  return sorted.map((t, i) => {
    cumPnl += t.netPnl;
    return {
      index: i + 1,
      cumPnl: Math.round(cumPnl * 100) / 100,
      pnl: t.netPnl,
      date: new Date(t.entryAt).toLocaleDateString(locale, { month: "short", day: "numeric" }),
    };
  });
}

export function buildDrawdownCurve(trades: ClosedTrade[], locale = "en-US"): { index: number; drawdown: number; date: string }[] {
  const curve = buildEquityCurve(trades, locale);
  if (curve.length === 0) return [];
  let peak = 0;
  return curve.map((pt) => {
    if (pt.cumPnl > peak) peak = pt.cumPnl;
    const dd = peak > 0 ? ((peak - pt.cumPnl) / peak) * -100 : 0;
    return { index: pt.index, drawdown: Math.round(dd * 100) / 100, date: pt.date };
  });
}

export function buildRDistribution(
  trades: ClosedTrade[]
): { bucket: string; count: number; wins: number; losses: number }[] {
  const buckets: Record<string, { count: number; wins: number; losses: number }> = {};
  const rTrades = trades.filter((t) => t.rMultiple !== null);
  for (const t of rTrades) {
    const r = t.rMultiple!;
    const floored = Math.floor(r * 2) / 2;
    const key = floored >= 0 ? `+${floored.toFixed(1)}R` : `${floored.toFixed(1)}R`;
    if (!buckets[key]) buckets[key] = { count: 0, wins: 0, losses: 0 };
    buckets[key].count++;
    if (t.netPnl > 0) buckets[key].wins++;
    else buckets[key].losses++;
  }
  return Object.entries(buckets)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([bucket, data]) => ({ bucket, ...data }));
}

export function buildSetupStats(trades: ClosedTrade[]): {
  name: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  avgR: number | null;
}[] {
  const map: Record<string, { name: string; pnls: number[]; rs: (number | null)[] }> = {};
  for (const t of trades) {
    const key = t.setup?.name ?? "Sin Setup";
    if (!map[key]) map[key] = { name: key, pnls: [], rs: [] };
    map[key].pnls.push(t.netPnl);
    map[key].rs.push(t.rMultiple);
  }
  return Object.values(map).map(({ name, pnls, rs }) => {
    const wins = pnls.filter((p) => p > 0).length;
    const rValues = rs.filter((r): r is number => r !== null);
    return {
      name,
      count: pnls.length,
      wins,
      losses: pnls.length - wins,
      winRate: pnls.length ? (wins / pnls.length) * 100 : 0,
      netPnl: pnls.reduce((s, v) => s + v, 0),
      avgR: rValues.length ? rValues.reduce((s, v) => s + v, 0) / rValues.length : null,
    };
  });
}

export function buildMonthlyStats(trades: ClosedTrade[]): {
  month: string;
  netPnl: number;
  count: number;
  wins: number;
}[] {
  const map: Record<string, { netPnl: number; count: number; wins: number }> = {};
  for (const t of trades) {
    const d = new Date(t.entryAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { netPnl: 0, count: 0, wins: 0 };
    map[key].netPnl += t.netPnl;
    map[key].count++;
    if (t.netPnl > 0) map[key].wins++;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data }));
}

export function buildDailyPnl(trades: ClosedTrade[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const t of trades) {
    const key = new Date(t.entryAt).toISOString().slice(0, 10);
    map[key] = (map[key] ?? 0) + t.netPnl;
  }
  return map;
}

export function computeStats(trades: ClosedTrade[], locale = "en-US") {
  const closed = trades.filter((t) => t.netPnl !== null && t.netPnl !== undefined);
  const wins = closed.filter((t) => t.netPnl > 0);
  const losses = closed.filter((t) => t.netPnl < 0);
  const rTrades = closed.filter((t) => t.rMultiple !== null);
  const curve = buildEquityCurve(closed, locale);
  const equityValues = curve.map((p) => p.cumPnl);

  return {
    totalTrades: closed.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: computeWinRate(closed),
    netPnl: closed.reduce((s, t) => s + t.netPnl, 0),
    grossWins: wins.reduce((s, t) => s + t.netPnl, 0),
    grossLosses: losses.reduce((s, t) => s + t.netPnl, 0),
    avgWin: wins.length ? wins.reduce((s, t) => s + t.netPnl, 0) / wins.length : 0,
    avgLoss: losses.length ? losses.reduce((s, t) => s + t.netPnl, 0) / losses.length : 0,
    bestTrade: closed.length ? Math.max(...closed.map((t) => t.netPnl)) : 0,
    worstTrade: closed.length ? Math.min(...closed.map((t) => t.netPnl)) : 0,
    profitFactor: computeProfitFactor(closed),
    maxDrawdown: computeMaxDrawdown(equityValues),
    sharpeRatio: computeSharpeRatio(closed),
    avgR: rTrades.length ? rTrades.reduce((s, t) => s + t.rMultiple!, 0) / rTrades.length : null,
    equityCurve: curve,
    drawdownCurve: buildDrawdownCurve(closed, locale),
  };
}

const MARKET_COLORS: Record<string, string> = {
  CME:     "#448aff",
  STOCKS:  "#00e676",
  CRYPTO:  "#d500f9",
  FOREX:   "#ff9800",
  OPTIONS: "#ffea00",
  GENERIC: "#90a4ae",
};

export function buildInstrumentMix(
  trades: ClosedTrade[]
): { market: string; count: number; color: string }[] {
  const counts: Record<string, number> = {};
  for (const t of trades) {
    const key = t.optionType ? "OPTIONS" : (t.instrument?.market ?? "GENERIC");
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([market, count]) => ({
      market,
      count,
      color: MARKET_COLORS[market] ?? "#90a4ae",
    }))
    .sort((a, b) => b.count - a.count);
}

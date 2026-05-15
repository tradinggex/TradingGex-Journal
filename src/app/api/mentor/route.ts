import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Trade = Record<string, any> & {
  netPnl: number;
  rMultiple: number | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JournalEntry = Record<string, any>;

function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  return arr.reduce((map, item) => {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
    return map;
  }, new Map<string, T[]>());
}

function stats(trades: Trade[]) {
  const total = trades.length;
  const wins = trades.filter((t) => t.netPnl > 0);
  const losses = trades.filter((t) => t.netPnl < 0);
  const grossW = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossL = losses.reduce((s, t) => s + Math.abs(t.netPnl), 0);
  const pf = grossL > 0 ? (grossW / grossL).toFixed(2) : "∞";
  const avgW = wins.length > 0 ? (grossW / wins.length).toFixed(0) : "0";
  const avgL = losses.length > 0 ? (grossL / losses.length).toFixed(0) : "0";
  const netPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const withR = trades.filter((t) => t.rMultiple !== null);
  const avgR =
    withR.length > 0
      ? (withR.reduce((s, t) => s + t.rMultiple!, 0) / withR.length).toFixed(2)
      : null;
  const wr = total > 0 ? ((wins.length / total) * 100).toFixed(1) : "0.0";
  return { total, wins: wins.length, losses: losses.length, wr, netPnl, pf, avgW, avgL, avgR };
}

const SYSTEM_PROMPT = `You are an elite trading mentor with deep expertise in ICT (Inner Circle Trader) methodology and professional trading psychology. You analyze a trader's performance data and provide honest, specific, and actionable feedback.

Your analysis must cover exactly these six sections in order:

## 1. Overall Performance
Assess win rate, profit factor, R multiples, net P&L, and consistency. Benchmark against professional standards (>50% WR, PF>1.5, avg R>0.5R).

## 2. Instrument Analysis
Identify best and worst instruments by P&L and win rate. Explain WHY certain instruments suit or don't suit this trader's style. Reference liquidity, volatility, and ICT structure quality per market.

## 3. ICT Knowledge Application
Evaluate how well they apply ICT concepts based on setup names, trade quality, and notes: Fair Value Gaps, Order Blocks, Breaker Blocks, Liquidity Sweeps, Market Structure (BOS/CHoCH), Premium/Discount Arrays, Kill Zone timing, CISD, Inducement. Grade their ICT proficiency level (Beginner/Intermediate/Advanced) with justification.

## 4. Emotional Patterns
Map emotional states to trading outcomes. Identify revenge trading, FOMO, and overconfidence signals. Show the P&L cost of negative emotional states with exact numbers.

## 5. Risk Management
Analyze stop placement consistency, position sizing, planned vs realized R adherence, fee impact on net P&L, and drawdown risk. Flag any rule-breaking patterns.

## 6. Priority Action Plan
List the top 3 specific, measurable improvements the trader must make immediately. Each action must include: the problem, the solution, and how to measure progress.

Rules:
- Be direct and specific — cite exact numbers from the data
- Connect every observation to ICT concepts where applicable
- Do not sugarcoat serious issues; name destructive patterns directly
- Use markdown with bold key metrics for readability
- Keep the total response under 1200 words`;

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [{ data: rawTrades }, { data: rawJournals }] = await Promise.all([
    supabase
      .from("Trade")
      .select("*, setup:Setup(name,color), instrument:Instrument(symbol,name,market)")
      .eq("userId", session.userId)
      .eq("status", "CLOSED")
      .not("netPnl", "is", null)
      .order("entryAt", { ascending: true })
      .limit(200),
    supabase
      .from("JournalEntry")
      .select("date,emotionalState,disciplineScore,followedRules,lessonsLearned,improvements")
      .eq("userId", session.userId)
      .order("date", { ascending: false })
      .limit(60),
  ]);

  const trades: Trade[] = (rawTrades ?? []).map((t) => ({
    ...t,
    netPnl: (t.netPnl as number) ?? 0,
    rMultiple: (t.rMultiple as number | null) ?? null,
  }));

  if (trades.length < 5) {
    return new Response("not_enough_trades", { status: 400 });
  }

  const journals: JournalEntry[] = rawJournals ?? [];
  const overall = stats(trades);

  const instrumentLines = Array.from(
    groupBy(trades, (t) => t.instrument?.symbol ?? "Unknown").entries()
  )
    .map(([sym, ts]) => {
      const s = stats(ts);
      const mkt = ts[0]?.instrument?.market ?? "";
      return `  - **${sym}** (${mkt}): ${s.total} trades, ${s.wr}% WR, P&L $${s.netPnl.toFixed(0)}, PF ${s.pf}${s.avgR ? `, avg R ${s.avgR}` : ""}`;
    })
    .join("\n");

  const setupLines = Array.from(
    groupBy(trades, (t) => t.setup?.name ?? "No Setup").entries()
  )
    .map(([name, ts]) => {
      const s = stats(ts);
      return `  - **${name}**: ${s.total} trades, ${s.wr}% WR, P&L $${s.netPnl.toFixed(0)}${s.avgR ? `, avg R ${s.avgR}` : ""}`;
    })
    .join("\n");

  const dirLines = Array.from(groupBy(trades, (t) => t.direction).entries())
    .map(([dir, ts]) => {
      const s = stats(ts);
      return `  - **${dir}**: ${s.total} trades, ${s.wr}% WR, P&L $${s.netPnl.toFixed(0)}`;
    })
    .join("\n");

  const emotionTrades = trades.filter((t) => t.emotion);
  const emotionLines =
    emotionTrades.length > 0
      ? Array.from(groupBy(emotionTrades, (t) => t.emotion).entries())
          .map(([emo, ts]) => {
            const s = stats(ts);
            const avgPnl = (s.netPnl / s.total).toFixed(0);
            return `  - **${emo}**: ${s.total} trades, ${s.wr}% WR, avg P&L $${avgPnl}`;
          })
          .join("\n")
      : "  (No emotional state recorded)";

  const qualityTrades = trades.filter((t) => t.quality);
  const qualityLines =
    qualityTrades.length > 0
      ? Array.from(groupBy(qualityTrades, (t) => String(t.quality)).entries())
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([q, ts]) => {
            const s = stats(ts);
            const avgPnl = (s.netPnl / s.total).toFixed(0);
            return `  - **Quality ${q}/5**: ${s.total} trades, ${s.wr}% WR, avg P&L $${avgPnl}`;
          })
          .join("\n")
      : "  (No quality data)";

  const recentNoted = trades.slice(-30);
  const mistakeLines = recentNoted
    .filter((t) => t.mistakes)
    .slice(-8)
    .map((t) => `  - "${t.mistakes}"`)
    .join("\n") || "  (None recorded)";

  const lessonLines = recentNoted
    .filter((t) => t.lessonsLearned)
    .slice(-8)
    .map((t) => `  - "${t.lessonsLearned}"`)
    .join("\n") || "  (None recorded)";

  let journalSection = "Journal: No entries yet.";
  if (journals.length > 0) {
    const withDisc = journals.filter((j) => j.disciplineScore !== null);
    const avgDisc =
      withDisc.length > 0
        ? (withDisc.reduce((s, j) => s + j.disciplineScore, 0) / withDisc.length).toFixed(1)
        : "N/A";
    const followed = journals.filter((j) => j.followedRules === true).length;
    const broke = journals.filter((j) => j.followedRules === false).length;
    const ruleRate =
      followed + broke > 0 ? (((followed / (followed + broke)) * 100).toFixed(0) + "%") : "N/A";
    const topEmotions = Array.from(
      groupBy(
        journals.filter((j) => j.emotionalState),
        (j) => j.emotionalState
      ).entries()
    )
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 4)
      .map(([e, js]) => `${e}(${js.length})`)
      .join(", ");
    journalSection = `Journal (${journals.length} entries):
  - Avg discipline: **${avgDisc}/10**
  - Followed rules: **${ruleRate}** of sessions
  - Top emotional states: ${topEmotions || "N/A"}`;
  }

  const withRisk = trades.filter((t) => t.riskAmount && t.riskAmount > 0);
  const totalFees = trades.reduce((s, t) => s + (t.fees ?? 0), 0);

  const userMessage = `Please analyze my trading performance:

## Summary (${trades.length} closed trades)
- Win Rate: **${overall.wr}%** | Wins: ${overall.wins} | Losses: ${overall.losses}
- Net P&L: **$${overall.netPnl.toFixed(0)}** | Profit Factor: **${overall.pf}**
- Avg Win: $${overall.avgW} | Avg Loss: $${overall.avgL}
${overall.avgR ? `- Avg R Multiple: **${overall.avgR}R**` : "- R multiples not consistently tracked"}
- Total Fees Paid: $${totalFees.toFixed(0)}
- Trades with defined risk: ${withRisk.length}/${trades.length}

## By Instrument
${instrumentLines}

## By Setup / Strategy
${setupLines}

## By Direction
${dirLines}

## Emotional State vs P&L
${emotionLines}

## Execution Quality vs P&L
${qualityLines}

## Recent Mistakes (last 30 trades)
${mistakeLines}

## Recent Lessons (last 30 trades)
${lessonLines}

## ${journalSection}`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on("end", () => controller.close());
      stream.on("error", (err: { message?: string }) => {
        // Encode the API error so the client can display it
        const msg = err.message ?? "Anthropic API error";
        controller.enqueue(encoder.encode(`\x00ERR\x00${msg}`));
        controller.close();
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
      "Cache-Control": "no-cache, no-store",
    },
  });
}

import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert trading mentor and performance coach specializing in ICT (Inner Circle Trader) methodology and futures trading psychology.

Analyze the trader's statistics and provide personalized, honest, and actionable feedback. Structure your response in clear sections using markdown:

1. **Overall Performance Summary** — Net P&L, win rate assessment, profit factor evaluation
2. **Best & Worst Instruments** — Which instruments they perform best/worst on and why
3. **ICT Concepts Application** — How well they're applying ICT setups based on their data
4. **Emotional & Psychological Patterns** — FOMO, revenge trading, overconfidence, anxiety patterns
5. **Risk Management** — R multiples, position sizing consistency
6. **Top 3 Specific Recommendations** — Concrete, actionable improvements

Be direct, specific, and base everything on the actual numbers provided. Do not give generic advice.`;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Fetch trades
  const { data: trades } = await supabase
    .from("Trade")
    .select("*, instrument:Instrument(*), setup:Setup(*)")
    .eq("userId", session.userId)
    .eq("status", "CLOSED")
    .not("netPnl", "is", null)
    .order("entryAt", { ascending: false })
    .limit(200);

  if (!trades || trades.length < 5) {
    return new Response(JSON.stringify({ error: "not_enough_trades" }), { status: 400 });
  }

  // Fetch journal entries
  const { data: journals } = await supabase
    .from("JournalEntry")
    .select("*")
    .eq("userId", session.userId)
    .order("date", { ascending: false })
    .limit(60);

  // Build stats
  const closed = trades;
  const wins = closed.filter((t) => t.netPnl > 0);
  const losses = closed.filter((t) => t.netPnl < 0);
  const netPnl = closed.reduce((s, t) => s + t.netPnl, 0);
  const winRate = (wins.length / closed.length) * 100;
  const grossWon = wins.reduce((s, t) => s + t.netPnl, 0);
  const grossLost = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));
  const profitFactor = grossLost === 0 ? 99 : grossWon / grossLost;
  const rTrades = closed.filter((t) => t.rMultiple !== null);
  const avgR = rTrades.length > 0 ? rTrades.reduce((s, t) => s + t.rMultiple, 0) / rTrades.length : null;

  // By instrument
  const byInstrument: Record<string, { count: number; pnl: number; wins: number }> = {};
  for (const t of closed) {
    const sym = t.instrument?.symbol ?? "Unknown";
    if (!byInstrument[sym]) byInstrument[sym] = { count: 0, pnl: 0, wins: 0 };
    byInstrument[sym].count++;
    byInstrument[sym].pnl += t.netPnl;
    if (t.netPnl > 0) byInstrument[sym].wins++;
  }

  // By setup
  const bySetup: Record<string, { count: number; pnl: number; wins: number }> = {};
  for (const t of closed) {
    const name = t.setup?.name ?? "No Setup";
    if (!bySetup[name]) bySetup[name] = { count: 0, pnl: 0, wins: 0 };
    bySetup[name].count++;
    bySetup[name].pnl += t.netPnl;
    if (t.netPnl > 0) bySetup[name].wins++;
  }

  // By emotion
  const byEmotion: Record<string, { count: number; pnl: number }> = {};
  for (const t of closed) {
    if (!t.emotion) continue;
    if (!byEmotion[t.emotion]) byEmotion[t.emotion] = { count: 0, pnl: 0 };
    byEmotion[t.emotion].count++;
    byEmotion[t.emotion].pnl += t.netPnl;
  }

  const userMessage = `
## My Trading Statistics (last ${closed.length} closed trades)

**Overall:**
- Net P&L: $${netPnl.toFixed(2)}
- Win Rate: ${winRate.toFixed(1)}% (${wins.length}W / ${losses.length}L)
- Profit Factor: ${profitFactor.toFixed(2)}
- Average R: ${avgR !== null ? avgR.toFixed(2) + "R" : "N/A"}

**By Instrument:**
${Object.entries(byInstrument)
  .sort((a, b) => b[1].pnl - a[1].pnl)
  .map(([sym, s]) => `- ${sym}: ${s.count} trades, ${((s.wins / s.count) * 100).toFixed(0)}% win rate, $${s.pnl.toFixed(2)} P&L`)
  .join("\n")}

**By Setup:**
${Object.entries(bySetup)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([name, s]) => `- ${name}: ${s.count} trades, ${((s.wins / s.count) * 100).toFixed(0)}% win rate, $${s.pnl.toFixed(2)} P&L`)
  .join("\n")}

**By Emotional State:**
${Object.entries(byEmotion)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([emo, s]) => `- ${emo}: ${s.count} trades, avg P&L $${(s.pnl / s.count).toFixed(2)}`)
  .join("\n")}

${journals && journals.length > 0 ? `**Journal insights (last ${journals.length} sessions):**
- Average discipline score: ${(journals.reduce((s, j) => s + (j.disciplineScore ?? 0), 0) / journals.length).toFixed(1)}/10
- Sessions following rules: ${journals.filter((j) => j.followedRules === true).length}/${journals.length}` : ""}

Please analyze my trading performance and give me specific, actionable feedback.`;

  const encoder = new TextEncoder();

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMessage }],
  });

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (delta) => controller.enqueue(encoder.encode(delta)));
      stream.on("end", () => controller.close());
      stream.on("error", (err: { message?: string }) => {
        controller.enqueue(encoder.encode(`\x00ERR\x00${err.message ?? "Anthropic API error"}`));
        controller.close();
      });
    },
    cancel() { stream.abort(); },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Accel-Buffering": "no" },
  });
}

import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const user = await requireUser();
    const cookieStore = await cookies();
    const activeAccountId = cookieStore.get("activeAccount")?.value ?? null;

    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from("Trade")
      .select("netPnl")
      .eq("userId", user.userId)
      .eq("status", "CLOSED")
      .not("netPnl", "is", null)
      .gte("entryAt", monday.toISOString())
      .lte("entryAt", sunday.toISOString());

    if (activeAccountId) {
      query = query.eq("fundedAccountId", activeAccountId);
    }

    const { data: trades } = await query;
    const list: { netPnl: number }[] = trades ?? [];

    const totalTrades = list.length;
    const wins = list.filter((t) => t.netPnl > 0).length;
    const losses = list.filter((t) => t.netPnl < 0).length;
    const pnl = list.reduce((sum, t) => sum + t.netPnl, 0);
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    return NextResponse.json({
      pnl,
      totalTrades,
      wins,
      losses,
      winRate,
      weekStart: monday.toISOString(),
      weekEnd: sunday.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

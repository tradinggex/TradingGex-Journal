import { requireUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { MentorView } from "@/components/mentor/MentorView";

export const dynamic = "force-dynamic";

export default async function MentorPage() {
  const user = await requireUser();

  const { count } = await supabase
    .from("Trade")
    .select("*", { count: "exact", head: true })
    .eq("userId", user.userId)
    .eq("status", "CLOSED")
    .not("netPnl", "is", null);

  return <MentorView tradeCount={count ?? 0} />;
}

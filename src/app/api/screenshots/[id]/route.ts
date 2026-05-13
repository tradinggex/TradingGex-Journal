import { NextRequest, NextResponse } from "next/server";
import { supabase, SCREENSHOTS_BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { data: screenshot } = await supabase
    .from("Screenshot")
    .select("id, url, tradeId, journalEntryId")
    .eq("id", id)
    .maybeSingle();

  if (!screenshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Verify ownership — the screenshot's parent trade or journal entry must belong to this user
  if (screenshot.tradeId) {
    const { data: trade } = await supabase
      .from("Trade")
      .select("id")
      .eq("id", screenshot.tradeId)
      .eq("userId", session.userId)
      .maybeSingle();
    if (!trade) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (screenshot.journalEntryId) {
    const { data: entry } = await supabase
      .from("JournalEntry")
      .select("id")
      .eq("id", screenshot.journalEntryId)
      .eq("userId", session.userId)
      .maybeSingle();
    if (!entry) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    // Screenshot not linked to anything — deny
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const urlParts = screenshot.url.split(`/public/${SCREENSHOTS_BUCKET}/`);
  if (urlParts.length === 2) {
    const storagePath = urlParts[1];
    await supabase.storage.from(SCREENSHOTS_BUCKET).remove([storagePath]);
  }

  await supabase.from("Screenshot").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

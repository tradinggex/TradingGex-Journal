import { NextRequest, NextResponse } from "next/server";
import { supabase, SCREENSHOTS_BUCKET } from "@/lib/supabase";
import { getSession } from "@/lib/session";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tradeId = formData.get("tradeId") as string | null;
    const journalEntryId = formData.get("journalEntryId") as string | null;

    if (!file || (!tradeId && !journalEntryId)) {
      return NextResponse.json({ error: "Missing file or entity ID" }, { status: 400 });
    }

    // File type validation — check MIME type, not just extension
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Only JPEG, PNG, WebP, and GIF are accepted." }, { status: 400 });
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 400 });
    }

    // Verify the trade or journal entry belongs to the logged-in user
    if (tradeId) {
      const { data: trade } = await supabase
        .from("Trade")
        .select("id")
        .eq("id", tradeId)
        .eq("userId", session.userId)
        .maybeSingle();
      if (!trade) {
        return NextResponse.json({ error: "Trade not found" }, { status: 404 });
      }
    } else if (journalEntryId) {
      const { data: entry } = await supabase
        .from("JournalEntry")
        .select("id")
        .eq("id", journalEntryId)
        .eq("userId", session.userId)
        .maybeSingle();
      if (!entry) {
        return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
      }
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const folder = tradeId ? `trade-${tradeId}` : `journal-${journalEntryId}`;
    const storagePath = `${folder}/${filename}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .upload(storagePath, Buffer.from(bytes), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .getPublicUrl(storagePath);

    const id = crypto.randomUUID();
    const { data: screenshot, error } = await supabase
      .from("Screenshot")
      .insert({
        id,
        url: publicUrl,
        ...(tradeId ? { tradeId } : { journalEntryId: journalEntryId! }),
      })
      .select("id, url")
      .single();

    if (error || !screenshot) {
      console.error("Screenshot DB error:", error);
      return NextResponse.json({ error: "Failed to save screenshot" }, { status: 500 });
    }

    return NextResponse.json({ id: screenshot.id, url: publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

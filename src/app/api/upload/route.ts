import { NextRequest, NextResponse } from "next/server";
import { supabase, SCREENSHOTS_BUCKET } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tradeId = formData.get("tradeId") as string | null;
    const journalEntryId = formData.get("journalEntryId") as string | null;

    if (!file || (!tradeId && !journalEntryId)) {
      return NextResponse.json({ error: "Missing file or entity ID" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const folder = tradeId ? `trade-${tradeId}` : `journal-${journalEntryId}`;
    const storagePath = `${folder}/${filename}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(SCREENSHOTS_BUCKET)
      .upload(storagePath, Buffer.from(bytes), {
        contentType: file.type || "image/jpeg",
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

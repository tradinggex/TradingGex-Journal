import { NextRequest, NextResponse } from "next/server";
import { supabase, SCREENSHOTS_BUCKET } from "@/lib/supabase";

export function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: screenshot } = await supabase
    .from("Screenshot")
    .select("id, url")
    .eq("id", id)
    .maybeSingle();

  if (!screenshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const urlParts = screenshot.url.split(`/public/${SCREENSHOTS_BUCKET}/`);
  if (urlParts.length === 2) {
    const storagePath = urlParts[1];
    await supabase.storage.from(SCREENSHOTS_BUCKET).remove([storagePath]);
  }

  await supabase.from("Screenshot").delete().eq("id", id);
  return NextResponse.json({ success: true });
}

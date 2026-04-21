import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase, SCREENSHOTS_BUCKET } from "@/lib/supabase";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const screenshot = await prisma.screenshot.findUnique({ where: { id } });
  if (!screenshot) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Derive storage path from URL: .../public/screenshots/{tradeId}/{filename}
  const urlParts = screenshot.url.split(`/public/${SCREENSHOTS_BUCKET}/`);
  if (urlParts.length === 2) {
    const storagePath = urlParts[1];
    await supabase.storage.from(SCREENSHOTS_BUCKET).remove([storagePath]);
  }

  await prisma.screenshot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

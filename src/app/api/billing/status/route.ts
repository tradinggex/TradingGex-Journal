import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await requireUser();
    const sub = await getUserSubscription(session.userId);
    return NextResponse.json(sub);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

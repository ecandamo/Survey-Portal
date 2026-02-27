import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    const body = await req.json();
    const ok = await verifyAdmin(body?.password || "");
    if (!ok) return NextResponse.json({ error: "Invalid password." }, { status: 401 });

    // Simplest approach: a single shared key stored in env.
    // You can rotate it any time by changing ADMIN_VIEW_KEY.
    return NextResponse.json({ ok: true, key: process.env.ADMIN_VIEW_KEY });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Server error." }, { status: 500 });
  }
}

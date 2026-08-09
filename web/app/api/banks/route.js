import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listBanks } from "@/lib/paystack/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const result = await listBanks();
  if (!result.ok) return NextResponse.json({ error: result.message || "Couldn't load banks" }, { status: 502 });

  return NextResponse.json({ banks: result.data.map((b) => ({ name: b.name, code: b.code })) });
}

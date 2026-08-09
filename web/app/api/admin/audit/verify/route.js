import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { verifyAuditChain } from "@/lib/audit/verify-chain";

export async function GET() {
  const guard = await requireAdmin(["full"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const result = await verifyAuditChain();
  return NextResponse.json(result);
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Temporary — presence-only check, deleted right after use.
export async function GET() {
  const guard = await requireAdmin(["tx", "full"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  return NextResponse.json({
    ART_TOKEN_ADDRESS: Boolean(process.env.ART_TOKEN_ADDRESS),
    ART_OPERATOR_USER_EMAIL: Boolean(process.env.ART_OPERATOR_USER_EMAIL),
    MONAD_RPC_URL: Boolean(process.env.MONAD_RPC_URL),
    ART_SAFE_ADDRESS: Boolean(process.env.ART_SAFE_ADDRESS),
  });
}

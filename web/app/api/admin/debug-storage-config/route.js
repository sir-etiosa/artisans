import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// Temporary — presence-only check, deleted right after use.
export async function GET() {
  const guard = await requireAdmin(["tx", "full"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}

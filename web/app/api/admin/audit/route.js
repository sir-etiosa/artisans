import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/require-admin";

const DEFAULT_PAGE_SIZE = 25;

// Full admins only — this is the record of everything everyone else does,
// including other admins.
export async function GET(request) {
  const guard = await requireAdmin(["full"]);
  if (guard.error) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE));

  const rows = await db.query.auditLogs.findMany({
    orderBy: desc(auditLogs.seq),
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const [{ count }] = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(auditLogs);

  return NextResponse.json({ logs: rows, page, pageSize, total: count });
}

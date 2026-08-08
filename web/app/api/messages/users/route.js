import { NextResponse } from "next/server";
import { ne } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

// Every other registered user — there's no real people-search yet, so this
// is what backs the "start a new conversation" picker.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const rows = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, role: users.role })
    .from(users)
    .where(ne(users.id, session.userId));

  return NextResponse.json({ users: rows });
}

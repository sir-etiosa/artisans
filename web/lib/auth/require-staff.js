import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./session";

export async function requireStaff() {
  const session = await getSession();
  if (!session) return { error: "Not signed in", status: 401 };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user || !user.isStaff) return { error: "Not authorized", status: 403 };

  return { user };
}

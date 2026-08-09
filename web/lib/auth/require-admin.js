import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "./session";

// "full" satisfies any allowedRoles check — it's the superset role.
export async function requireAdmin(allowedRoles) {
  const session = await getSession();
  if (!session) return { error: "Not signed in", status: 401 };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user?.adminRole) return { error: "Not authorized", status: 403 };
  if (user.adminRole !== "full" && !allowedRoles.includes(user.adminRole)) {
    return { error: "Not authorized", status: 403 };
  }

  return { user };
}

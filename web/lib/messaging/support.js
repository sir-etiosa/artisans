import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

// Support-role admins first, full admins as a fallback — whoever's meant
// to actually staff the inbox.
export async function getSupportUserId() {
  const supportAdmin = await db.query.users.findFirst({ where: eq(users.adminRole, "support") });
  if (supportAdmin) return supportAdmin.id;

  const fullAdmin = await db.query.users.findFirst({ where: eq(users.adminRole, "full") });
  return fullAdmin?.id || null;
}

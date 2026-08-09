import { createHash } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

const GENESIS_HASH = "0".repeat(64);

// Arbitrary constant scoped to this one lock — serializes concurrent
// writers so `prevHash` always reflects the true latest row. Without this,
// two simultaneous events could both read the same "latest" row and each
// insert claiming it as their predecessor, silently forking the chain.
const LOCK_KEY = 847362910;

function computeHash(prevHash, fields) {
  return createHash("sha256").update(prevHash + JSON.stringify(fields)).digest("hex");
}

// Fire-and-forget by design: an audit-write failure shouldn't be able to
// take down the actual signup/payment/etc. it's recording, so errors are
// logged, never thrown. Call sites don't need to wrap this in try/catch.
export async function logAuditEvent({ actorUserId = null, actorEmail = null, eventType, targetType = null, targetId = null, metadata = {} }) {
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${LOCK_KEY})`);

      const [last] = await tx.select({ hash: auditLogs.hash }).from(auditLogs).orderBy(sql`${auditLogs.seq} desc`).limit(1);
      const prevHash = last?.hash || GENESIS_HASH;

      const createdAt = new Date();
      const fields = { actorUserId, actorEmail, eventType, targetType, targetId, metadata, createdAt: createdAt.toISOString() };
      const hash = computeHash(prevHash, fields);

      await tx.insert(auditLogs).values({ actorUserId, actorEmail, eventType, targetType, targetId, metadata, createdAt, prevHash, hash });
    });
  } catch (err) {
    console.error("audit log write failed:", eventType, err);
  }
}

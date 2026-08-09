import { createHash } from "crypto";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { canonicalStringify } from "./canonical-json";

const GENESIS_HASH = "0".repeat(64);

function computeHash(prevHash, fields) {
  return createHash("sha256").update(prevHash + canonicalStringify(fields)).digest("hex");
}

// Recomputes every row's hash from its own content and compares against
// what's stored — any edited or deleted row breaks the chain from that
// point on, which is exactly the point of hash-chaining it in the first
// place. Read-only; never touches the table.
export async function verifyAuditChain() {
  const rows = await db.query.auditLogs.findMany({ orderBy: asc(auditLogs.seq) });

  let expectedPrevHash = GENESIS_HASH;
  for (const row of rows) {
    if (row.prevHash !== expectedPrevHash) {
      return { ok: false, brokenAtSeq: Number(row.seq), reason: "prevHash doesn't match the preceding row's hash", checked: rows.length };
    }
    const fields = {
      actorUserId: row.actorUserId, actorEmail: row.actorEmail, eventType: row.eventType,
      targetType: row.targetType, targetId: row.targetId, metadata: row.metadata,
      createdAt: row.createdAt.toISOString(),
    };
    const recomputed = computeHash(expectedPrevHash, fields);
    if (recomputed !== row.hash) {
      return { ok: false, brokenAtSeq: Number(row.seq), reason: "row content doesn't match its recorded hash", checked: rows.length };
    }
    expectedPrevHash = row.hash;
  }

  return { ok: true, brokenAtSeq: null, reason: null, checked: rows.length };
}

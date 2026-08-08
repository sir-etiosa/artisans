import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations } from "@/db/schema";

/* userAId/userBId are stored sorted so a (userX, userY) pair only ever
   maps to one row, regardless of which side initiates. */
export async function getOrCreateConversation(userId1, userId2) {
  const [userAId, userBId] = [userId1, userId2].sort();

  const existing = await db.query.conversations.findFirst({
    where: and(eq(conversations.userAId, userAId), eq(conversations.userBId, userBId)),
  });
  if (existing) return existing;

  const [created] = await db.insert(conversations).values({ userAId, userBId }).returning();
  return created;
}

export function otherParticipantId(conversation, currentUserId) {
  return conversation.userAId === currentUserId ? conversation.userBId : conversation.userAId;
}

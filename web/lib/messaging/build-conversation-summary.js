import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { otherParticipantId } from "./get-or-create-conversation";

export async function buildConversationSummary(conversation, currentUserId) {
  const otherId = otherParticipantId(conversation, currentUserId);

  const [other] = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, otherId));

  const lastMessage = await db.query.messages.findFirst({
    where: eq(messages.conversationId, conversation.id),
    orderBy: desc(messages.createdAt),
  });

  const unread = await db
    .select({ id: messages.id })
    .from(messages)
    .where(and(eq(messages.conversationId, conversation.id), eq(messages.senderId, otherId), isNull(messages.readAt)));

  return {
    id: conversation.id,
    other,
    lastMessage: lastMessage
      ? { body: lastMessage.body, createdAt: lastMessage.createdAt, mine: lastMessage.senderId === currentUserId }
      : null,
    unreadCount: unread.length,
  };
}

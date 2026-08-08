import { NextResponse } from "next/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { otherParticipantId } from "@/lib/messaging/get-or-create-conversation";

export async function GET(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const conversation = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conversation || (conversation.userAId !== session.userId && conversation.userBId !== session.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const otherId = otherParticipantId(conversation, session.userId);

  // These three don't depend on each other's results, so run them together
  // instead of paying for a round trip each.
  const [[other], thread] = await Promise.all([
    db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users).where(eq(users.id, otherId)),
    db.query.messages.findMany({ where: eq(messages.conversationId, id), orderBy: asc(messages.createdAt) }),
    db
      .update(messages)
      .set({ readAt: new Date() })
      .where(and(eq(messages.conversationId, id), eq(messages.senderId, otherId), isNull(messages.readAt))),
  ]);

  return NextResponse.json({ conversation: { id: conversation.id, other }, messages: thread });
}

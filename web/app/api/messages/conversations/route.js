import { NextResponse } from "next/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { getOrCreateConversation } from "@/lib/messaging/get-or-create-conversation";
import { buildConversationSummary } from "@/lib/messaging/build-conversation-summary";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db.query.conversations.findMany({
    where: or(eq(conversations.userAId, session.userId), eq(conversations.userBId, session.userId)),
  });

  const summaries = await Promise.all(rows.map((c) => buildConversationSummary(c, session.userId)));
  summaries.sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

  return NextResponse.json({ conversations: summaries });
}

const createSchema = z.object({ otherUserId: z.string().uuid() });

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.otherUserId === session.userId) {
    return NextResponse.json({ error: "Can't message yourself" }, { status: 400 });
  }

  const conversation = await getOrCreateConversation(session.userId, parsed.data.otherUserId);
  return NextResponse.json({ conversation });
}

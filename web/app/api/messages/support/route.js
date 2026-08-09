import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { getOrCreateConversation } from "@/lib/messaging/get-or-create-conversation";
import { getSupportUserId } from "@/lib/messaging/support";

const schema = z.object({ note: z.string().trim().max(2000).optional() });

// Backs the "Message support" button — starts (or reuses) a conversation
// with whoever's staffing support, optionally opening with context (e.g.
// which booking this is about) so support doesn't start from zero.
export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const supportUserId = await getSupportUserId();
  if (!supportUserId) return NextResponse.json({ error: "Support isn't set up yet" }, { status: 503 });
  if (supportUserId === session.userId) return NextResponse.json({ error: "You are support" }, { status: 400 });

  const conversation = await getOrCreateConversation(session.userId, supportUserId);

  if (parsed.data.note) {
    await db.insert(messages).values({ conversationId: conversation.id, senderId: session.userId, body: parsed.data.note });
  }

  return NextResponse.json({ conversationId: conversation.id });
}

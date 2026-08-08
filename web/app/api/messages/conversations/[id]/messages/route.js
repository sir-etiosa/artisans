import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

const schema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function POST(request, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const conversation = await db.query.conversations.findFirst({ where: eq(conversations.id, id) });
  if (!conversation || (conversation.userAId !== session.userId && conversation.userBId !== session.userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const [message] = await db
    .insert(messages)
    .values({ conversationId: id, senderId: session.userId, body: parsed.data.body })
    .returning();

  return NextResponse.json({ message });
}

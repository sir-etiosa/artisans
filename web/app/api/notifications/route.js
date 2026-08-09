import { NextResponse } from "next/server";
import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { conversations, bookings, artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { buildConversationSummary } from "@/lib/messaging/build-conversation-summary";

// No "seen/dismissed" tracking yet — this surfaces current unread messages
// and current pending/recent bookings, not a persistent notification log.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const convRows = await db.query.conversations.findMany({
    where: or(eq(conversations.userAId, session.userId), eq(conversations.userBId, session.userId)),
  });
  const summaries = await Promise.all(convRows.map((c) => buildConversationSummary(c, session.userId)));
  const unreadMessages = summaries
    .filter((s) => s.unreadCount > 0)
    .map((s) => ({ conversationId: s.id, fromName: s.other.fullName, unreadCount: s.unreadCount }));

  const ownProfile = await db.query.artisanProfiles.findFirst({ where: eq(artisanProfiles.userId, session.userId) });

  const bookingRequests = ownProfile
    ? await db
        .select({ id: bookings.id, jobDescription: bookings.jobDescription, customerName: users.fullName, createdAt: bookings.createdAt })
        .from(bookings)
        .innerJoin(users, eq(users.id, bookings.customerId))
        .where(and(eq(bookings.artisanProfileId, ownProfile.id), eq(bookings.status, "pending")))
        .orderBy(desc(bookings.createdAt))
        .limit(10)
    : [];

  const bookingUpdates = await db
    .select({ id: bookings.id, jobDescription: bookings.jobDescription, status: bookings.status, createdAt: bookings.createdAt })
    .from(bookings)
    .where(and(eq(bookings.customerId, session.userId), or(eq(bookings.status, "accepted"), eq(bookings.status, "completed"))))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

  return NextResponse.json({ unreadMessages, bookingRequests, bookingUpdates });
}

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { artisanProfiles, users } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { supabaseAdmin, isStorageConfigured } from "@/lib/storage/supabase-admin";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Image storage isn't configured yet" }, { status: 503 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user || user.verificationStatus !== "verified") {
    return NextResponse.json({ error: "Verify your identity before posting goods" }, { status: 403 });
  }
  const profile = await db.query.artisanProfiles.findFirst({
    where: and(eq(artisanProfiles.userId, user.id), isNull(artisanProfiles.deletedAt)),
  });
  if (!profile) return NextResponse.json({ error: "Create your artisan profile before posting goods" }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Image must be a JPEG, PNG, or WebP" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Each image must be under 2MB" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${user.id}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin().storage.from("goods").upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: "Upload failed" }, { status: 502 });

  const { data } = supabaseAdmin().storage.from("goods").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}

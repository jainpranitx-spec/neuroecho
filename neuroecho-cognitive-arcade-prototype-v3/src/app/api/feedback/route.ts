import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { feedbackMessages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get("deviceId");
    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    const messages = await db
      .select()
      .from(feedbackMessages)
      .where(eq(feedbackMessages.deviceId, deviceId))
      .orderBy(asc(feedbackMessages.createdAt));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!deviceId || !message) {
      return NextResponse.json({ error: "deviceId and message are required" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message is too long (max 1000 characters)." }, { status: 400 });
    }

    const [inserted] = await db
      .insert(feedbackMessages)
      .values({ deviceId, direction: "user_to_dev", message })
      .returning();

    return NextResponse.json({ message: inserted }, { status: 201 });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Could not send feedback. Please try again." }, { status: 500 });
  }
}

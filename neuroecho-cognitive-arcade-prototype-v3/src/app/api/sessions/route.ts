import { NextResponse } from "next/server";
import { db } from "@/db";
import { gameSessions, userProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const sessions = await db
      .select()
      .from(gameSessions)
      .orderBy(desc(gameSessions.createdAt))
      .limit(20);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { gameType, score, maxScore, accuracyPercentage, durationSeconds, details } = body;

    const profiles = await db.select().from(userProfiles).limit(1);
    let profileId = profiles[0]?.id;

    if (!profileId) {
      const [newProfile] = await db.insert(userProfiles).values({}).returning();
      profileId = newProfile.id;
    }

    // Insert game session
    const [insertedSession] = await db
      .insert(gameSessions)
      .values({
        profileId,
        gameType,
        score: score || 0,
        maxScore: maxScore || 100,
        accuracyPercentage: accuracyPercentage || 100,
        durationSeconds: durationSeconds || 0,
        details: details || {}
      })
      .returning();

    // Award XP to user profile
    const xpGained = Math.round((score || 50) * 1.2);
    if (profiles[0]) {
      await db
        .update(userProfiles)
        .set({
          totalXp: (profiles[0].totalXp || 0) + xpGained,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.id, profileId));
    }

    return NextResponse.json({
      session: insertedSession,
      xpGained
    });
  } catch (error) {
    console.error("Error saving session:", error);
    return NextResponse.json({ error: "Failed to save game session" }, { status: 500 });
  }
}

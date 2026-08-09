import { NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const profiles = await db.select().from(userProfiles).limit(1);
    
    if (profiles.length === 0) {
      // Create initial profile
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          name: "Senior Explorer",
          age: 72,
          difficultyLevel: "standard",
          speechRate: "0.9",
          tremorAssist: true,
          highContrast: false,
          voiceFeedbackEnabled: true,
          cognitiveGoals: ["Memory Audit", "Motor Coordination", "Logical Sequencing"],
          streakDays: 3,
          totalXp: 420
        })
        .returning();
      return NextResponse.json(newProfile);
    }

    return NextResponse.json(profiles[0]);
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Return fallback profile if DB query encounters issue
    return NextResponse.json({
      id: "fallback-id",
      name: "Senior Explorer",
      age: 72,
      difficultyLevel: "standard",
      speechRate: "0.9",
      tremorAssist: true,
      highContrast: false,
      voiceFeedbackEnabled: true,
      cognitiveGoals: ["Memory Audit", "Motor Coordination", "Logical Sequencing"],
      streakDays: 3,
      totalXp: 420
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const profiles = await db.select().from(userProfiles).limit(1);

    if (profiles.length === 0) {
      const [inserted] = await db.insert(userProfiles).values(body).returning();
      return NextResponse.json(inserted);
    } else {
      const [updated] = await db
        .update(userProfiles)
        .set({
          ...body,
          updatedAt: new Date()
        })
        .where(eq(userProfiles.id, profiles[0].id))
        .returning();
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

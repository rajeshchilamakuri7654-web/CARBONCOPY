import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    // Fetch users ordered by points descending
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        streak: true,
        role: true,
        badges: {
          select: {
            badgeName: true,
          },
        },
        emissionRecords: {
          select: {
            totalEmissions: true,
          },
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        points: "desc",
      },
      take: 20, // Top 20 users
    });

    // Format output
    const leaderboard = users.map((user, idx) => {
      // Calculate carbon footprint if available, otherwise default
      const latestFootprint = user.emissionRecords[0]?.totalEmissions ?? 0;
      
      // Mask email for privacy
      const [localPart, domain] = user.email.split("@");
      const maskedEmail = `${localPart.substring(0, 3)}***@${domain}`;

      return {
        rank: idx + 1,
        id: user.id,
        name: user.name || "Eco Citizen",
        email: maskedEmail,
        points: user.points,
        streak: user.streak,
        badgeCount: user.badges.length,
        latestFootprint,
        role: user.role,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading the leaderboard" },
      { status: 500 }
    );
  }
}

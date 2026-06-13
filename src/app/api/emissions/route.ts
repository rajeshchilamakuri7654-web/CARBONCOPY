import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  calculateTransportationEmissions,
  calculateElectricityEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateScoreAndRating,
  FoodType,
} from "@/lib/carbonCalculator";

// GET: Fetch historical emission entries for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const entries = await prisma.emissionRecord.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching emissions:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching emission records" },
      { status: 500 }
    );
  }
}

// POST: Save a new carbon footprint entry
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      carDistance = 0,
      bikeDistance = 0,
      busDistance = 0,
      trainDistance = 0,
      flightDistance = 0,
      electricityKwh = 0,
      foodType = "mixed",
      wasteKg = 0,
    } = body;

    // Calculate sub-emissions
    const transportEmissions = calculateTransportationEmissions(
      carDistance,
      bikeDistance,
      busDistance,
      trainDistance,
      flightDistance
    );
    const electricityEmissions = calculateElectricityEmissions(electricityKwh);
    const foodEmissions = calculateFoodEmissions(foodType as FoodType);
    const wasteEmissions = calculateWasteEmissions(wasteKg);

    const totalEmissions = Number(
      (transportEmissions + electricityEmissions + foodEmissions + wasteEmissions).toFixed(2)
    );

    const { score, rating } = calculateScoreAndRating(totalEmissions);

    // Save to database
    const record = await prisma.emissionRecord.create({
      data: {
        userId,
        carDistance,
        bikeDistance,
        busDistance,
        trainDistance,
        flightDistance,
        transportEmissions,
        electricityKwh,
        electricityEmissions,
        foodType,
        foodEmissions,
        wasteKg,
        wasteEmissions,
        totalEmissions,
        carbonScore: score,
        rating,
      },
    });

    // Update user points and streak gamification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { badges: true },
    });

    let pointsEarned = 50; // standard points for submitting a log
    let newStreak = user?.streak || 1;

    // Optional streak verification logic (if logged in last 24-48 hours)
    if (user?.lastLogin) {
      const hoursSinceLastLogin = (new Date().getTime() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastLogin > 20 && hoursSinceLastLogin < 48) {
        newStreak += 1;
        pointsEarned += 20; // bonus for keeping the streak alive!
      } else if (hoursSinceLastLogin >= 48) {
        newStreak = 1; // reset streak
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: pointsEarned },
        streak: newStreak,
        lastLogin: new Date(),
      },
    });

    // Gamification check: Check if new badges should be awarded
    const hasExplorerBadge = user?.badges.some((b) => b.badgeName === "Eco Explorer");
    const recordCount = await prisma.emissionRecord.count({ where: { userId } });
    
    if (recordCount >= 3 && !hasExplorerBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeName: "Eco Explorer",
          description: "Logged your emissions at least 3 times. Tracking builds consistency!",
          icon: "Compass",
        },
      });
    }

    // Gamification check: Low Carbon footprint award (Carbon Warrior)
    const hasWarriorBadge = user?.badges.some((b) => b.badgeName === "Carbon Warrior");
    if (totalEmissions < 250 && !hasWarriorBadge) {
      await prisma.userBadge.create({
        data: {
          userId,
          badgeName: "Carbon Warrior",
          description: "Achieved an ultra-sustainable monthly carbon output under 250 kg CO2.",
          icon: "Shield",
        },
      });
    }

    return NextResponse.json({
      record,
      pointsEarned,
      newStreak,
      totalPoints: updatedUser.points,
    });
  } catch (error) {
    console.error("Error creating emission record:", error);
    return NextResponse.json(
      { error: "An error occurred while saving emission record" },
      { status: 500 }
    );
  }
}

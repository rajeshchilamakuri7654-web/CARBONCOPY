/**
 * @file src/app/api/emissions/route.ts
 * @description REST API handler for carbon emission records.
 *
 * GET  /api/emissions — Fetch all emission records for the authenticated user
 * POST /api/emissions — Save a new emission record and update gamification state
 *
 * Security: All endpoints require authentication via NextAuth session.
 * Validation: Request bodies are validated with Zod before processing.
 */

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { withApiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/db";
import {
  calculateTransportationEmissions,
  calculateElectricityEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateScoreAndRating,
} from "@/lib/carbonCalculator";
import { createEmissionSchema, safeValidate } from "@/lib/validators";
import type { FoodType } from "@/types";

// ─── GET Handler ──────────────────────────────────────────────────────────────

/**
 * Fetches all historical emission records for the currently authenticated user,
 * ordered by most recent first.
 */
export const GET = withApiHandler(async ({ session }) => {
  const entries = await prisma.emissionRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ entries });
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

/**
 * Creates a new emission record for the authenticated user.
 * Also handles gamification: awards points, updates streak, and checks for new badges.
 */
export const POST = withApiHandler(async ({ req, session }) => {
  // Validate request body
  const body: unknown = await req.json();
  const validation = safeValidate(createEmissionSchema, body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 422 }
    );
  }

  const {
    carDistance,
    bikeDistance,
    busDistance,
    trainDistance,
    flightDistance,
    electricityKwh,
    foodType,
    wasteKg,
  } = validation.data;

  // ── Calculate sub-emissions ──────────────────────────────────────────────
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

  // ── Persist the record ───────────────────────────────────────────────────
  const record = await prisma.emissionRecord.create({
    data: {
      userId: session.user.id,
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

  // ── Gamification: Points & Streak ────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { badges: true },
  });

  let pointsEarned = 50; // Base points for submitting a log
  let newStreak = user?.streak ?? 1;

  if (user?.lastLogin) {
    const hoursSinceLast =
      (Date.now() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60);

    if (hoursSinceLast > 20 && hoursSinceLast < 48) {
      // Streak maintained: bonus points
      newStreak += 1;
      pointsEarned += 20;
    } else if (hoursSinceLast >= 48) {
      // Streak broken: reset to 1
      newStreak = 1;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      points: { increment: pointsEarned },
      streak: newStreak,
      lastLogin: new Date(),
    },
  });

  // ── Gamification: Badge Checks ───────────────────────────────────────────
  const badgePromises: Promise<unknown>[] = [];

  // "Eco Explorer" badge: Logged 3+ times
  const hasExplorerBadge = user?.badges.some((b) => b.badgeName === "Eco Explorer");
  if (!hasExplorerBadge) {
    const recordCount = await prisma.emissionRecord.count({
      where: { userId: session.user.id },
    });
    if (recordCount >= 3) {
      badgePromises.push(
        prisma.userBadge.create({
          data: {
            userId: session.user.id,
            badgeName: "Eco Explorer",
            description: "Logged emissions at least 3 times. Consistency builds habits!",
            icon: "Compass",
          },
        })
      );
    }
  }

  // "Carbon Warrior" badge: Monthly footprint below 250 kg CO₂e
  const hasWarriorBadge = user?.badges.some((b) => b.badgeName === "Carbon Warrior");
  if (!hasWarriorBadge && totalEmissions < 250) {
    badgePromises.push(
      prisma.userBadge.create({
        data: {
          userId: session.user.id,
          badgeName: "Carbon Warrior",
          description: "Achieved an ultra-sustainable monthly output under 250 kg CO₂e.",
          icon: "Shield",
        },
      })
    );
  }

  // Run badge checks in parallel
  if (badgePromises.length > 0) {
    await Promise.all(badgePromises);
  }

  return NextResponse.json({
    record,
    pointsEarned,
    newStreak,
    totalPoints: updatedUser.points,
  });
});

/**
 * @file src/app/api/goals/route.ts
 * @description REST API handler for user carbon reduction goals.
 *
 * GET  /api/goals — Fetch all goals for the authenticated user
 * POST /api/goals — Create a new reduction goal and award points
 *
 * Security: Both endpoints require authentication.
 * Validation: POST body validated with Zod.
 */

import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { withApiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/db";
import { createGoalSchema, safeValidate } from "@/lib/validators";

// ─── GET Handler ──────────────────────────────────────────────────────────────

/**
 * Returns all goals for the currently authenticated user,
 * ordered by most recently created first.
 */
export const GET = withApiHandler(async ({ session }) => {
  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ goals });
});

// ─── POST Handler ─────────────────────────────────────────────────────────────

/**
 * Creates a new reduction goal for the authenticated user.
 * Awards 25 eco-points for setting a goal.
 */
export const POST = withApiHandler(async ({ req, session }) => {
  // Validate request body
  const body: unknown = await req.json();
  const validation = safeValidate(createGoalSchema, body);

  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 422 });
  }

  const {
    title,
    category,
    targetReduction,
    targetValue,
    currentValue,
    endDate,
  } = validation.data;

  // Create goal and award points in parallel
  const [goal] = await Promise.all([
    prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        category,
        targetReduction,
        targetValue,
        currentValue,
        endDate: new Date(endDate),
        completed: false,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 25 } },
    }),
  ]);

  return NextResponse.json({ goal }, { status: 201 });
});

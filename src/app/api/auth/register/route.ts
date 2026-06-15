/**
 * @file src/app/api/auth/register/route.ts
 * @description User registration API handler.
 *
 * POST /api/auth/register — Creates a new user account
 *
 * Validates input with Zod, hashes password with bcrypt,
 * and awards a "Green Beginner" badge to new users.
 */

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema, safeValidate } from "@/lib/validators";

/**
 * Registers a new user account.
 * - Validates request body with Zod schema
 * - Checks for duplicate email (409 Conflict)
 * - Hashes password with bcrypt (10 salt rounds)
 * - Creates user with 100 starting points and a "Green Beginner" badge
 *
 * @returns 201 on success, 409 if email taken, 422 on validation error, 500 on server error
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Validate and parse request body
    const body: unknown = await req.json();
    const validation = safeValidate(registerSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 422 });
    }

    const { email, password, name } = validation.data;

    // Check for existing account
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password (10 rounds is the recommended security/performance balance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with initial gamification state and welcome badge
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        points: 100,
        streak: 1,
        badges: {
          create: {
            badgeName: "Green Beginner",
            description:
              "Joined the CarbonIQ platform and began the sustainability journey.",
            icon: "Leaf",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/register] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Retrieve user goals
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching goals" },
      { status: 500 }
    );
  }
}

// POST: Create a new goal
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { title, category, targetReduction, targetValue, currentValue, endDate } = body;

    if (!title || !category || !targetValue || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, targetValue, endDate" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        category,
        targetReduction: Number(targetReduction) || 0,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue) || 0,
        endDate: new Date(endDate),
        completed: false,
      },
    });

    // Award user points for setting a goal
    await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 25 },
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the goal" },
      { status: 500 }
    );
  }
}

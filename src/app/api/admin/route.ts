import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Retrieve platform metrics and user list
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // 1. Platform Metrics
    const totalUsers = await prisma.user.count();
    const totalLogs = await prisma.emissionRecord.count();
    const totalArticles = await prisma.educationArticle.count();
    
    // Average monthly emissions across all entries
    const emissionsAgg = await prisma.emissionRecord.aggregate({
      _avg: {
        totalEmissions: true,
      },
    });
    const avgEmissions = emissionsAgg._avg.totalEmissions || 0;

    // Total points awarded
    const pointsAgg = await prisma.user.aggregate({
      _sum: {
        points: true,
      },
    });
    const totalPoints = pointsAgg._sum.points || 0;

    // 2. Complete User List
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        streak: true,
        createdAt: true,
        _count: {
          select: {
            emissionRecords: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalLogs,
        totalArticles,
        avgEmissions: Number(avgEmissions.toFixed(1)),
        totalPoints,
      },
      users,
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while loading administration stats" },
      { status: 500 }
    );
  }
}

// POST: Publish a new educational article
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, summary, content, carbonSaved } = body;

    if (!title || !category || !summary || !content) {
      return NextResponse.json(
        { error: "Missing required fields: title, category, summary, content" },
        { status: 400 }
      );
    }

    const article = await prisma.educationArticle.create({
      data: {
        title,
        category,
        summary,
        content,
        carbonSaved: Number(carbonSaved) || 0,
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Admin article creation error:", error);
    return NextResponse.json(
      { error: "An error occurred while publishing the article" },
      { status: 500 }
    );
  }
}

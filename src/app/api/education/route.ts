import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Retrieve educational articles
export async function GET(req: Request) {
  try {
    const articles = await prisma.educationArticle.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching articles" },
      { status: 500 }
    );
  }
}

// POST: Increment read count of an article
export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const updatedArticle = await prisma.educationArticle.update({
      where: { id: articleId },
      data: {
        reads: { increment: 1 },
      },
    });

    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error("Error incrementing read count:", error);
    return NextResponse.json(
      { error: "An error occurred while updating article reads" },
      { status: 500 }
    );
  }
}

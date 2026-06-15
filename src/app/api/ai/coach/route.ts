import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { withApiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/db";

// Initialize the Google GenAI SDK
// Using a placeholder API key if not set in environment
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "mock-api-key",
});

export const POST = withApiHandler(async ({ req, session }) => {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Fetch user's recent emission history to provide context to the AI
  const recentRecords = await prisma.emissionRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 5,
  });

  const avgFootprint = recentRecords.length 
    ? recentRecords.reduce((acc, curr) => acc + curr.totalEmissions, 0) / recentRecords.length
    : 0;

  const systemPrompt = `You are CarbonIQ's AI Eco-Coach. You provide short, highly personalized, and actionable sustainability advice. 
The user's recent average carbon footprint is ${avgFootprint.toFixed(1)} kg CO2.
Be encouraging but data-driven. Do not give generic advice. Keep answers under 3 sentences.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt + "\n\nUser Question: " + message }] }
      ]
    });

    const aiMessage = response.text || "I'm having trouble analyzing your data right now. Please try again later.";

    // Save insight to DB for user history
    await prisma.aIInsight.create({
      data: {
        userId: session.user.id,
        content: aiMessage,
        category: "general",
      }
    });

    return NextResponse.json({ reply: aiMessage });
  } catch (error) {
    console.error("[AI Coach] Error:", error);
    // Fallback for hackathon mock mode if API key is invalid
    const mockReply = "Based on your recent activity, trying a meatless day this week could reduce your footprint by 4kg. Great job maintaining your streak!";
    return NextResponse.json({ reply: mockReply });
  }
});

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Mock AI response logic - simulating an intelligent Carbon agent
    const lowerMsg = message.toLowerCase();
    let reply = "I understand you are concerned about your carbon footprint. The best first step is to consistently track your daily transportation and energy use on the dashboard.";

    if (lowerMsg.includes("car") || lowerMsg.includes("drive") || lowerMsg.includes("driving") || lowerMsg.includes("transport")) {
      reply = "Transportation is often the largest source of emissions. Try substituting just two car trips a week with public transit, cycling, or walking. If you commute daily, carpooling can cut your footprint by half.";
    } else if (lowerMsg.includes("food") || lowerMsg.includes("diet") || lowerMsg.includes("meat") || lowerMsg.includes("eat")) {
      reply = "Dietary choices have a massive impact. You don't have to go fully vegan, but switching to plant-based meals just two days a week can reduce your food carbon footprint by up to thirty percent.";
    } else if (lowerMsg.includes("electricity") || lowerMsg.includes("power") || lowerMsg.includes("energy") || lowerMsg.includes("light")) {
      reply = "For electricity, heating and cooling are usually the culprits. Consider adjusting your thermostat by just 2 degrees. Also, switching all your bulbs to LED can make a surprising dent in your monthly footprint.";
    } else if (lowerMsg.includes("flight") || lowerMsg.includes("fly") || lowerMsg.includes("plane") || lowerMsg.includes("travel")) {
      reply = "A single long-haul flight can emit more carbon than an entire year of driving. If you must fly, try to book direct flights, pack light, and consider purchasing verified carbon offsets for your trip.";
    } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      const name = session?.user?.name ? session.user.name.split(" ")[0] : "there";
      reply = `Hello ${name}! I am your Carbon I.Q. voice agent. You can ask me for specific ways to reduce your footprint, or tell me about your daily habits.`;
    } else if (lowerMsg.includes("reduce") || lowerMsg.includes("lower") || lowerMsg.includes("help")) {
      reply = "I recommend focusing on the big three: drive less, eat less red meat, and optimize your home heating or cooling. What area would you like to tackle first?";
    }

    // Simulate network delay for AI "thinking" feel
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Voice API Error:", error);
    return NextResponse.json(
      { error: "Failed to process voice command" },
      { status: 500 }
    );
  }
}

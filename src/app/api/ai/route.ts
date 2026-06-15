import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch user's latest carbon entry
    const latestEntry = await prisma.emissionRecord.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    });

    if (!latestEntry) {
      return NextResponse.json(
        { error: "No emission records found. Please calculate your footprint first before asking for AI coaching." },
        { status: 400 }
      );
    }

    const {
      transportEmissions,
      electricityEmissions,
      foodEmissions,
      wasteEmissions,
      totalEmissions,
      carbonScore,
    } = latestEntry;

    // Determine highest emission sector
    const sectors = [
      { name: "Transportation", value: transportEmissions },
      { name: "Electricity", value: electricityEmissions },
      { name: "Food Habits", value: foodEmissions },
      { name: "Waste Management", value: wasteEmissions },
    ];
    sectors.sort((a, b) => b.value - a.value);
    const highestSector = sectors[0];

    const promptText = `
      User: ${session.user.name}
      Current Monthly Footprint: ${totalEmissions} kg CO2
      Eco Score: ${carbonScore}/100
      Sector Breakdowns:
      - Transportation: ${transportEmissions} kg CO2
      - Electricity: ${electricityEmissions} kg CO2
      - Diet Habits: ${foodEmissions} kg CO2
      - Waste Output: ${wasteEmissions} kg CO2
      
      Highest impact area is: ${highestSector.name} (${highestSector.value.toFixed(0)} kg CO2).
    `;

    // Check if OpenAI API Key is present in environment variables
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert Sustainability Coach. Provide personalized carbon footprint reduction recommendations based on the user's data. Format your output in clean Markdown with clear headings and bullet points.",
              },
              {
                role: "user",
                content: `Here are my carbon metrics: ${promptText}. Provide 3 custom high-impact actions I can take this month.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          const markdownContent = aiData.choices[0].message.content;
          return NextResponse.json({ suggestion: markdownContent });
        }
      } catch (err) {
        console.error("OpenAI API call failed, falling back to mock engine:", err);
      }
    }

    // FALLBACK: Rules-based detailed Mock Coach Recommendations
    let suggestionsMarkdown = `### 🌿 Hello ${session.user.name}, I'm your AI Sustainability Coach!

Based on your latest footprint of **${totalEmissions} kg CO₂/mo** (Eco Score: **${carbonScore}/100**), here is your personalized carbon reduction plan. 

Your highest emissions source is **${highestSector.name}**, accounting for **${(highestSector.value / totalEmissions * 100).toFixed(0)}%** of your total carbon output. Let's target this area first!

---

#### 🚨 Priority Actions for ${highestSector.name}

`;

    if (highestSector.name === "Transportation") {
      suggestionsMarkdown += `1. **Switch to Active Commuting**: For trips under 3 km, try walking or cycling. This produces **0 kg CO₂** and can lower your transit footprint by **15-20%** immediately.
2. **Utilize Public Rails**: If you commute by car, substituting just 2 days of driving with metro or train commuting will save roughly **45 kg CO₂** per month.
3. **Optimize Flight Routes**: Avoid short-haul flights. Direct high-speed train routes have a carbon footprint that is **75% lower** than short commercial flights.`;
    } else if (highestSector.name === "Electricity") {
      suggestionsMarkdown += `1. **Transition to LED Lighting**: Swap your top 5 most used incandescent bulbs for LEDs. This reduces lighting electricity draw by **75%** and saves about **12 kg CO₂** monthly.
2. **Unplug Phantom Loads**: Electronics draw standby power. Plugging media centers or office setups into smart power strips that cut power entirely can save **8%** on utility bills.
3. **Set Thermostat Offsets**: Lowering home heating by 2°C in winter (or raising cooling in summer) drops HVAC-related carbon emissions by **120 kg CO₂** annually.`;
    } else if (highestSector.name === "Food Habits") {
      suggestionsMarkdown += `1. **Adopt "Meatless Mondays"**: Shifting from a high-meat diet to vegetarian meals just 1 day per week saves **15.4 kg CO₂** every month.
2. **Prevent Food Spillage**: Check your fridge inventory weekly. Preventing organic waste from ending up in landfills cuts household greenhouse gases by **10%**.
3. **Choose Local Legumes**: Replace one beef dinner weekly with local beans or lentils. Legumes have a carbon cost that is **30x lower** than pasture beef.`;
    } else {
      suggestionsMarkdown += `1. **Implement Composting**: Create a simple compost bin for organic food scraps. Composting aerobically avoids anaerobic landfill methane and cuts waste footprint by **50%**.
2. **Decline Single-Use Plastics**: Carry reusable shopping bags, water bottles, and steel straws.
3. **Practice Material Re-Use**: Before throwing items away, check if they can be upcycled or donated. Product lifecycle extensions dramatically drop industrial carbon manufacturing footprints.`;
    }

    suggestionsMarkdown += `

---

#### 💡 General Sustainability Guidelines
* **Target: 15% Reduction** — Setting a goal in your dashboard to reduce emissions by 15% this month will award you **+25 points**!
* **Daily eco log** — Consistent log entries maintain your streak multiplier and boost points.
* **Keep Learning** — Read our articles in the **Educational Hub** to unlock more guides on solar and active transit.

*Together, we can loop down your emissions. Good luck!* 🌳`;

    return NextResponse.json({ suggestion: suggestionsMarkdown });
  } catch (error) {
    console.error("AI Coach error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while generating recommendations" },
      { status: 500 }
    );
  }
}

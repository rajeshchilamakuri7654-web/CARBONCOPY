import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/db";
import { calculateTransportationEmissions, calculateElectricityEmissions, calculateScoreAndRating } from "@/lib/carbonCalculator";

export const POST = withApiHandler(async ({ req, session }) => {
  const { integrationType } = await req.json();

  if (!integrationType) {
    return NextResponse.json({ error: "Missing integration type" }, { status: 400 });
  }

  let newRecord;
  let summaryMessage = "";

  try {
    // ── Simulate Google Maps Integration ──
    if (integrationType === "maps") {
      // Mocked distances (e.g., from weekly commute)
      const carDistance = 45.5; 
      const trainDistance = 12.0;
      
      const transportEmissions = calculateTransportationEmissions(carDistance, 0, 0, trainDistance, 0);
      const { score, rating } = calculateScoreAndRating(transportEmissions);

      newRecord = await prisma.emissionRecord.create({
        data: {
          userId: session.user.id,
          carDistance,
          trainDistance,
          transportEmissions,
          totalEmissions: transportEmissions,
          carbonScore: score,
          rating,
          date: new Date(),
        }
      });
      summaryMessage = `Synced commute data: ${carDistance}km driving and ${trainDistance}km train. Logged ${transportEmissions.toFixed(1)}kg CO2.`;
    } 
    // ── Simulate Smart Home (Nest/Ecobee) Integration ──
    else if (integrationType === "smarthome") {
      // Mocked weekly electricity draw
      const electricityKwh = 120.4;
      
      const electricityEmissions = calculateElectricityEmissions(electricityKwh);
      const { score, rating } = calculateScoreAndRating(electricityEmissions);

      newRecord = await prisma.emissionRecord.create({
        data: {
          userId: session.user.id,
          electricityKwh,
          electricityEmissions,
          totalEmissions: electricityEmissions,
          carbonScore: score,
          rating,
          date: new Date(),
        }
      });
      summaryMessage = `Synced smart thermostat data: ${electricityKwh}kWh used. Logged ${electricityEmissions.toFixed(1)}kg CO2.`;
    }
    // ── Simulate Financial (Plaid) Integration ──
    else if (integrationType === "financial") {
      // Mocked grocery spending converted to emissions (very simplified)
      const spendAmount = 150; // $150 groceries
      const mockEmissions = spendAmount * 0.2; // roughly 30kg
      const { score, rating } = calculateScoreAndRating(mockEmissions);

      newRecord = await prisma.emissionRecord.create({
        data: {
          userId: session.user.id,
          foodType: "mixed",
          foodEmissions: mockEmissions,
          totalEmissions: mockEmissions,
          carbonScore: score,
          rating,
          date: new Date(),
        }
      });
      summaryMessage = `Synced banking transactions: Identified grocery spend. Logged ${mockEmissions.toFixed(1)}kg CO2.`;
    } 
    // ── Simulate IoT Smart Plug ──
    else if (integrationType === "iot_plug") {
      const mockEmissions = calculateElectricityEmissions(4.2); // e.g. 4.2 kWh from the plug
      const { score, rating } = calculateScoreAndRating(mockEmissions);

      newRecord = await prisma.emissionRecord.create({
        data: {
          userId: session.user.id,
          electricityKwh: 4.2,
          electricityEmissions: mockEmissions,
          totalEmissions: mockEmissions,
          carbonScore: score,
          rating,
          date: new Date(),
        }
      });
      summaryMessage = `Synced IoT Plug data: Device used 4.2kWh. Logged ${mockEmissions.toFixed(2)}kg CO2.`;
    }
    // ── Simulate Voice Assistant Webhook ──
    else if (integrationType === "voice_assistant") {
      summaryMessage = `Voice Webhook Authorized. You can now say "Siri, log 10 miles driven."`;
      // Don't create a record, just auth the webhook
    } else {
      return NextResponse.json({ error: "Unknown integration type" }, { status: 400 });
    }

    // Award bonus points for automation
    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 10 } }
    });

    return NextResponse.json({ success: true, message: summaryMessage, record: newRecord });

  } catch (error) {
    console.error("[Integrations API Error]:", error);
    return NextResponse.json({ error: "Failed to sync external data" }, { status: 500 });
  }
});

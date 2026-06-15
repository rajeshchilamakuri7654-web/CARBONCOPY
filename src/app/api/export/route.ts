import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/apiHandler";
import { prisma } from "@/lib/db";

export const GET = withApiHandler(async ({ session }) => {
  try {
    const records = await prisma.emissionRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    if (!records.length) {
      return NextResponse.json({ error: "No emission records found to export." }, { status: 404 });
    }

    // CSV Header
    let csvContent = "Date,Car Distance (km),Flight Distance (km),Electricity (kWh),Food Type,Total Emissions (kg CO2),Score\n";

    // Append Rows
    for (const record of records) {
      const row = [
        new Date(record.date).toISOString().split('T')[0],
        record.carDistance.toFixed(2),
        record.flightDistance.toFixed(2),
        record.electricityKwh.toFixed(2),
        record.foodType,
        record.totalEmissions.toFixed(2),
        record.carbonScore.toFixed(0)
      ].join(",");
      csvContent += row + "\n";
    }

    // Return as a downloadable CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="carboniq-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[Export API Error]:", error);
    return NextResponse.json({ error: "Failed to generate export file" }, { status: 500 });
  }
});

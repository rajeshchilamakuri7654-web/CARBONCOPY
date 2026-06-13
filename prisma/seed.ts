import { PrismaClient } from "./generated/prisma/client/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.educationArticle.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.emissionRecord.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const user = await prisma.user.create({
    data: {
      email: "user@carbon.com",
      name: "Alex Green",
      password: hashedPassword,
      role: "USER",
      points: 720,
      streak: 7,
      lastLogin: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@carbon.com",
      name: "Sustainability Admin",
      password: hashedPassword,
      role: "ADMIN",
      points: 1200,
      streak: 15,
      lastLogin: new Date(),
    },
  });

  console.log("Users created:", { user: user.email, admin: admin.email });

  // 2. Create historical Emission Records for User (last 6 months)
  const now = new Date();
  
  // 5 months ago
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth() - 5, 15),
      carDistance: 1200,
      bikeDistance: 50,
      busDistance: 100,
      trainDistance: 0,
      flightDistance: 1500,
      transportEmissions: 1200 * 0.18 + 1500 * 0.15 + 100 * 0.08, // 449 kg
      electricityKwh: 350,
      electricityEmissions: 350 * 0.45, // 157.5 kg
      foodType: "non-vegetarian",
      foodEmissions: 4.0 * 30.5, // 122 kg
      wasteKg: 40,
      wasteEmissions: 40 * 0.5, // 20 kg
      totalEmissions: 449 + 157.5 + 122 + 20, // 748.5 kg
      carbonScore: Math.round(100 - (748.5 / 8)), // 6
      rating: "High Impact",
    },
  });

  // 4 months ago
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth() - 4, 15),
      carDistance: 1000,
      bikeDistance: 80,
      busDistance: 200,
      trainDistance: 50,
      flightDistance: 0,
      transportEmissions: 1000 * 0.18 + 200 * 0.08 + 50 * 0.04, // 198 kg
      electricityKwh: 320,
      electricityEmissions: 320 * 0.45, // 144 kg
      foodType: "mixed",
      foodEmissions: 2.5 * 30.5, // 76.25 kg
      wasteKg: 35,
      wasteEmissions: 35 * 0.5, // 17.5 kg
      totalEmissions: 198 + 144 + 76.25 + 17.5, // 435.75 kg
      carbonScore: Math.round(100 - (435.75 / 8)), // 46
      rating: "Moderate Impact",
    },
  });

  // 3 months ago
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth() - 3, 15),
      carDistance: 800,
      bikeDistance: 120,
      busDistance: 300,
      trainDistance: 100,
      flightDistance: 0,
      transportEmissions: 800 * 0.18 + 300 * 0.08 + 100 * 0.04, // 172 kg
      electricityKwh: 280,
      electricityEmissions: 280 * 0.45, // 126 kg
      foodType: "mixed",
      foodEmissions: 2.5 * 30.5, // 76.25 kg
      wasteKg: 30,
      wasteEmissions: 30 * 0.5, // 15 kg
      totalEmissions: 172 + 126 + 76.25 + 15, // 389.25 kg
      carbonScore: Math.round(100 - (389.25 / 8)), // 51
      rating: "Moderate Impact",
    },
  });

  // 2 months ago
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth() - 2, 15),
      carDistance: 500,
      bikeDistance: 200,
      busDistance: 400,
      trainDistance: 200,
      flightDistance: 0,
      transportEmissions: 500 * 0.18 + 400 * 0.08 + 200 * 0.04, // 130 kg
      electricityKwh: 220,
      electricityEmissions: 220 * 0.45, // 99 kg
      foodType: "vegetarian",
      foodEmissions: 1.5 * 30.5, // 45.75 kg
      wasteKg: 25,
      wasteEmissions: 25 * 0.5, // 12.5 kg
      totalEmissions: 130 + 99 + 45.75 + 12.5, // 287.25 kg
      carbonScore: Math.round(100 - (287.25 / 8)), // 64
      rating: "Moderate Impact",
    },
  });

  // 1 month ago
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      carDistance: 300,
      bikeDistance: 250,
      busDistance: 500,
      trainDistance: 300,
      flightDistance: 0,
      transportEmissions: 300 * 0.18 + 500 * 0.08 + 300 * 0.04, // 106 kg
      electricityKwh: 180,
      electricityEmissions: 180 * 0.45, // 81 kg
      foodType: "vegetarian",
      foodEmissions: 1.5 * 30.5, // 45.75 kg
      wasteKg: 20,
      wasteEmissions: 20 * 0.5, // 10 kg
      totalEmissions: 106 + 81 + 45.75 + 10, // 242.75 kg
      carbonScore: Math.round(100 - (242.75 / 8)), // 70
      rating: "Moderate Impact",
    },
  });

  // This month
  await prisma.emissionRecord.create({
    data: {
      userId: user.id,
      date: now,
      carDistance: 150,
      bikeDistance: 300,
      busDistance: 600,
      trainDistance: 400,
      flightDistance: 0,
      transportEmissions: 150 * 0.18 + 600 * 0.08 + 400 * 0.04, // 91 kg
      electricityKwh: 150,
      electricityEmissions: 150 * 0.45, // 67.5 kg
      foodType: "vegetarian",
      foodEmissions: 1.5 * 30.5, // 45.75 kg
      wasteKg: 15,
      wasteEmissions: 15 * 0.5, // 7.5 kg
      totalEmissions: 91 + 67.5 + 45.75 + 7.5, // 211.75 kg
      carbonScore: Math.round(100 - (211.75 / 8)), // 74
      rating: "Moderate Impact",
    },
  });

  console.log("Historical emission records created.");

  // 3. Create Goals
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: "Reduce commute emissions by 25%",
        category: "transport",
        targetReduction: 25.0,
        targetValue: 80.0,
        currentValue: 91.0,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        completed: false,
      },
      {
        userId: user.id,
        title: "Limit electricity usage below 180 kWh",
        category: "electricity",
        targetReduction: 15.0,
        targetValue: 180.0,
        currentValue: 150.0,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth(), 1),
        completed: true,
      },
      {
        userId: user.id,
        title: "Adopt plant-based meals 5 days a week",
        category: "food",
        targetReduction: 30.0,
        targetValue: 45.0,
        currentValue: 45.75,
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        completed: true,
      },
    ],
  });

  console.log("User goals created.");

  // 4. Create Badges
  await prisma.userBadge.createMany({
    data: [
      {
        userId: user.id,
        badgeName: "Green Beginner",
        description: "Registered for the Carbon Footprint Awareness Platform and took the first step.",
        icon: "Leaf",
        unlockedAt: new Date(now.getFullYear(), now.getMonth() - 5, 15),
      },
      {
        userId: user.id,
        badgeName: "Eco Explorer",
        description: "Logged emissions for 3 consecutive months.",
        icon: "Compass",
        unlockedAt: new Date(now.getFullYear(), now.getMonth() - 3, 15),
      },
      {
        userId: user.id,
        badgeName: "Carbon Warrior",
        description: "Reduced monthly emissions by more than 30% compared to baseline.",
        icon: "Shield",
        unlockedAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
      },
    ],
  });

  console.log("User badges created.");

  // 5. Create Educational Articles
  await prisma.educationArticle.createMany({
    data: [
      {
        title: "Understanding Your Carbon Footprint",
        category: "General",
        summary: "An introduction to carbon emissions, why they matter, and how everyday actions drive climate change.",
        content: `A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions. Globally, the average carbon footprint for a person is close to 4 tons. To avoid a 2°C rise in global temperatures, the average global carbon footprint per year needs to drop to under 2 tons by 2050.

### Major Contributors
1. **Transportation**: Burning fossil fuels for cars, flights, and public transit.
2. **Household Energy**: Using electricity powered by coal, oil, or gas.
3. **Food Choices**: Meat production, especially beef, requires extensive land and emits methane.
4. **Waste**: Landfills release methane as organic matter breaks down anaerobically.

Reducing our footprint starts with awareness. By measuring daily emissions, we can identify high-impact areas and make structural adjustments.`,
        reads: 145,
        carbonSaved: 10.0,
      },
      {
        title: "Top 5 Ways to Cut Energy Use at Home",
        category: "Energy",
        summary: "Actionable energy-saving habits that reduce electricity bills and cut carbon emissions simultaneously.",
        content: `Heating, cooling, and electricity use represent a major portion of residential carbon emissions. By upgrading fixtures and building better habits, you can drop emissions by up to 25%.

### Easy Tips to Begin
- **Switch to LEDs**: LED bulbs use 75% less energy and last 25 times longer than incandescent lighting.
- **Unplug Phantom Loads**: Electronics draw power even when turned off. Use smart power strips to cut power completely.
- **Optimize Thermostat**: Lowering your thermostat by just 1-2 degrees in winter or raising it in summer can reduce heating/cooling emissions by 10%.
- **Wash Clothes in Cold Water**: About 75% to 90% of the energy your washing machine uses goes toward heating the water.
- **Air Dry When Possible**: Clothes dryers consume substantial energy. Sunlight is free and zero-carbon!`,
        reads: 89,
        carbonSaved: 25.0,
      },
      {
        title: "How Diet Impacts the Planet",
        category: "Food",
        summary: "Why shifting to a plant-based or vegetarian diet is one of the most effective personal actions against climate change.",
        content: `What we eat matters just as much as how we travel. Food systems are responsible for roughly one-third of global greenhouse gas emissions.

### The Footprint of Food
- **Beef and Lamb**: Have the highest carbon footprint per gram of protein due to methane emissions from enteric fermentation and land-use requirements.
- **Dairy Products**: Milk, cheese, and butter contribute significant emissions through dairy farming processes.
- **Plants**: Grains, vegetables, fruits, and beans have a footprint that is 10 to 50 times lower than animal proteins.

### What You Can Do
1. **Meatless Mondays**: Skipping meat just one day a week saves roughly 3.6 kg of CO2 per day.
2. **Reduce Food Waste**: One-third of all food produced globally goes to waste. If food waste were a country, it would be the third-largest emitter of greenhouse gases.
3. **Eat Local & Seasonal**: Reduces emissions associated with long-distance refrigerated transport.`,
        reads: 112,
        carbonSaved: 15.0,
      },
      {
        title: "The Ultimate Guide to Sustainable Travel",
        category: "Transport",
        summary: "From active mobility to high-speed trains, learn how to transition to low-carbon commuting.",
        content: `Transportation accounts for around 20% of global CO2 emissions. For individuals, commuting and flying are often the largest single parts of their carbon footprint.

### Transport Modes Compared (kg CO2 per km)
- **Single-Occupant Passenger Car**: ~0.18 kg
- **Electric Vehicle (EV)**: ~0.05 kg (depending on grid source)
- **Bus / Public Transit**: ~0.08 kg
- **Train / Rail**: ~0.04 kg
- **Aviation (per passenger)**: ~0.15 kg

### Sustainable Travel Tips
- **Active Transit**: Walk or bike for trips under 3 km. It is healthy, free, and completely emissions-free.
- **Public Transport First**: Opt for buses and trains. A fully loaded train has a fraction of the per-person footprint of individual cars.
- **Limit Aviation**: Fly only when necessary, choose direct routes, and offset emissions if available.
- **Carpool**: Sharing a ride halves your travel footprint instantly.`,
        reads: 76,
        carbonSaved: 30.0,
      },
    ],
  });

  console.log("Educational articles created.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

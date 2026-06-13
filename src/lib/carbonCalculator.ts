// Emission factors (in kg CO2 equivalent)
export const EMISSION_FACTORS = {
  transportation: {
    car: 0.18,      // per km
    bike: 0.0,      // per km
    bus: 0.08,      // per km
    train: 0.04,     // per km
    flight: 0.15,    // per km
  },
  electricity: 0.45, // per kWh
  food: {
    vegetarian: 1.5, // per day
    mixed: 2.5,      // per day
    "non-vegetarian": 4.0, // per day
  },
  waste: 0.5, // per kg
};

export type FoodType = "vegetarian" | "mixed" | "non-vegetarian";

/**
 * Calculates monthly transportation emissions in kg CO2
 */
export function calculateTransportationEmissions(
  carKm: number,
  bikeKm: number,
  busKm: number,
  trainKm: number,
  flightKm: number
): number {
  const car = carKm * EMISSION_FACTORS.transportation.car;
  const bike = bikeKm * EMISSION_FACTORS.transportation.bike;
  const bus = busKm * EMISSION_FACTORS.transportation.bus;
  const train = trainKm * EMISSION_FACTORS.transportation.train;
  const flight = flightKm * EMISSION_FACTORS.transportation.flight;
  return Number((car + bike + bus + train + flight).toFixed(2));
}

/**
 * Calculates monthly electricity emissions in kg CO2
 */
export function calculateElectricityEmissions(kwh: number): number {
  return Number((kwh * EMISSION_FACTORS.electricity).toFixed(2));
}

/**
 * Calculates monthly food emissions in kg CO2
 */
export function calculateFoodEmissions(foodType: FoodType): number {
  const dailyEmissions = EMISSION_FACTORS.food[foodType] || EMISSION_FACTORS.food.mixed;
  return Number((dailyEmissions * 30.5).toFixed(2)); // average days per month
}

/**
 * Calculates monthly waste emissions in kg CO2
 */
export function calculateWasteEmissions(wasteKg: number): number {
  return Number((wasteKg * EMISSION_FACTORS.waste).toFixed(2));
}

/**
 * Calculates carbon score (0-100, higher is better/more sustainable) and impact rating
 * Average monthly footprint for an individual is ~400 kg CO2.
 */
export function calculateScoreAndRating(totalEmissions: number): {
  score: number;
  rating: string;
} {
  // Score out of 100. If emissions are 0, score is 100. If emissions are 800+ kg, score is 0.
  const score = Math.max(0, Math.min(100, Math.round(100 - (totalEmissions / 8))));
  
  let rating = "Moderate Impact";
  if (score >= 75) {
    rating = "Low Impact";
  } else if (score < 40) {
    rating = "High Impact";
  }

  return { score, rating };
}

/**
 * Calculates equivalent trees planted to offset emissions saved (in kg)
 * A mature tree absorbs roughly 22kg of CO2 per year, which is ~1.83kg per month.
 */
export function calculateTreesEquivalent(co2SavedKg: number): number {
  if (co2SavedKg <= 0) return 0;
  return Number((co2SavedKg / 22).toFixed(1));
}

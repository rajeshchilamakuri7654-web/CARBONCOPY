/**
 * @file src/lib/carbonCalculator.ts
 * @description Carbon emission calculation utilities.
 *
 * All emission factors are sourced from:
 * - IPCC Sixth Assessment Report (AR6), 2021
 * - U.S. EPA Greenhouse Gas Equivalencies Calculator
 * - European Environment Agency (EEA) emission factors
 *
 * Units: All functions return values in **kg CO₂ equivalent (kg CO₂e)**.
 */

import type { FoodType, ImpactRating, ScoreAndRating } from "@/types";
export type { FoodType, ImpactRating, ScoreAndRating } from "@/types";

// ─── Emission Factor Constants ────────────────────────────────────────────────

/**
 * Emission factors in kg CO₂e per unit.
 * Sources: IPCC AR6, EPA, EEA.
 *
 * @constant
 */
export const EMISSION_FACTORS = {
  /**
   * Transportation emission factors in kg CO₂e per km traveled.
   * - car: Average gasoline/diesel passenger car (IPCC)
   * - bike: Zero-emission active transport
   * - bus: Shared diesel urban bus (EEA)
   * - train: Average electric/diesel rail (EEA)
   * - flight: Economy class short-haul aviation (IPCC)
   */
  transportation: {
    car: 0.18,     // kg CO₂e / km
    bike: 0.0,     // kg CO₂e / km
    bus: 0.08,     // kg CO₂e / km
    train: 0.04,   // kg CO₂e / km
    flight: 0.15,  // kg CO₂e / km
  } as const,

  /**
   * Average global electricity grid emission factor.
   * Source: IEA World Energy Outlook 2023.
   * Unit: kg CO₂e per kWh consumed.
   */
  electricity: 0.45, // kg CO₂e / kWh

  /**
   * Dietary emission factors in kg CO₂e per person per day.
   * Source: Oxford University food carbon study (Poore & Nemecek, 2018).
   * - vegetarian: Plant-based diet, no meat/fish
   * - mixed: Average omnivore diet (moderate meat)
   * - non-vegetarian: High-meat diet (frequent red meat)
   */
  food: {
    vegetarian: 1.5,        // kg CO₂e / day
    mixed: 2.5,             // kg CO₂e / day
    "non-vegetarian": 4.0,  // kg CO₂e / day
  } as const satisfies Record<FoodType, number>,

  /**
   * Municipal solid waste landfill emission factor.
   * Source: EPA Waste Reduction Model (WARM).
   * Unit: kg CO₂e per kg waste sent to landfill.
   */
  waste: 0.5, // kg CO₂e / kg

  /**
   * Average days per month used for monthly food emission calculations.
   */
  DAYS_PER_MONTH: 30.5,

  /**
   * Annual CO₂ absorption of a single mature tree (kg/year).
   * Source: European Environment Agency.
   * Used to convert saved emissions to tree-planting equivalents.
   */
  TREE_ABSORPTION_KG_PER_YEAR: 22,

  /**
   * Baseline average monthly footprint per person (kg CO₂e/month).
   * Used to calculate the eco-score and relative comparisons.
   * Source: Global Carbon Project 2023.
   */
  AVERAGE_MONTHLY_FOOTPRINT: 450,
} as const;

// ─── Calculation Functions ────────────────────────────────────────────────────

/**
 * Calculates monthly transportation emissions from all travel modes.
 *
 * @param carKm - Monthly car/gasoline vehicle distance in km
 * @param bikeKm - Monthly bicycle/walking distance in km (zero emissions)
 * @param busKm - Monthly bus commuting distance in km
 * @param trainKm - Monthly metro/rail distance in km
 * @param flightKm - Monthly flight distance in km (converted from annual)
 * @returns Total monthly transport emissions in kg CO₂e, rounded to 2 decimal places
 *
 * @example
 * // 250km car + 100km bus = 45 + 8 = 53kg CO₂e
 * calculateTransportationEmissions(250, 0, 100, 0, 0); // 53.00
 */
export function calculateTransportationEmissions(
  carKm: number,
  bikeKm: number,
  busKm: number,
  trainKm: number,
  flightKm: number
): number {
  const { car, bike, bus, train, flight } = EMISSION_FACTORS.transportation;
  const total =
    carKm * car +
    bikeKm * bike +
    busKm * bus +
    trainKm * train +
    flightKm * flight;
  return Number(total.toFixed(2));
}

/**
 * Calculates monthly electricity consumption emissions.
 *
 * @param kwh - Monthly electricity usage in kilowatt-hours
 * @returns Monthly electricity emissions in kg CO₂e, rounded to 2 decimal places
 *
 * @example
 * // 150 kWh × 0.45 = 67.5 kg CO₂e
 * calculateElectricityEmissions(150); // 67.50
 */
export function calculateElectricityEmissions(kwh: number): number {
  return Number((kwh * EMISSION_FACTORS.electricity).toFixed(2));
}

/**
 * Calculates monthly food/diet emissions based on dietary pattern.
 *
 * @param foodType - Dietary pattern: "vegetarian" | "mixed" | "non-vegetarian"
 * @returns Monthly food emissions in kg CO₂e, rounded to 2 decimal places
 *
 * @example
 * // Vegetarian: 1.5 kg/day × 30.5 days = 45.75 kg CO₂e
 * calculateFoodEmissions("vegetarian"); // 45.75
 */
export function calculateFoodEmissions(foodType: FoodType): number {
  const dailyFactor = EMISSION_FACTORS.food[foodType] ?? EMISSION_FACTORS.food.mixed;
  return Number((dailyFactor * EMISSION_FACTORS.DAYS_PER_MONTH).toFixed(2));
}

/**
 * Calculates monthly waste management emissions from landfill decomposition.
 *
 * @param wasteKg - Monthly non-recycled solid waste in kilograms
 * @returns Monthly waste emissions in kg CO₂e, rounded to 2 decimal places
 *
 * @example
 * // 20 kg waste × 0.5 = 10 kg CO₂e
 * calculateWasteEmissions(20); // 10.00
 */
export function calculateWasteEmissions(wasteKg: number): number {
  return Number((wasteKg * EMISSION_FACTORS.waste).toFixed(2));
}

/**
 * Calculates an eco-score (0–100) and impact rating from total monthly emissions.
 *
 * Score formula: `100 - (totalEmissions / 8)`
 * - Score 75–100: Low Impact (sustainable lifestyle)
 * - Score 40–74: Moderate Impact (average consumer)
 * - Score 0–39: High Impact (significantly above average)
 *
 * @param totalEmissions - Total monthly CO₂e emissions in kg
 * @returns Object containing `score` (0–100) and `rating` string
 *
 * @example
 * calculateScoreAndRating(200); // { score: 75, rating: "Low Impact" }
 * calculateScoreAndRating(450); // { score: 44, rating: "Moderate Impact" }
 * calculateScoreAndRating(700); // { score: 13, rating: "High Impact" }
 */
export function calculateScoreAndRating(totalEmissions: number): ScoreAndRating {
  const score = Math.max(0, Math.min(100, Math.round(100 - totalEmissions / 8)));

  let rating: ImpactRating;
  if (score >= 75) {
    rating = "Low Impact";
  } else if (score >= 40) {
    rating = "Moderate Impact";
  } else {
    rating = "High Impact";
  }

  return { score, rating };
}

/**
 * Converts saved CO₂ emissions to equivalent number of trees planted per year.
 *
 * A mature tree absorbs approximately 22 kg CO₂/year (EEA).
 *
 * @param co2SavedKg - Total CO₂ saved (annual) in kg
 * @returns Number of equivalent trees required to absorb the saved CO₂, rounded to 1 decimal
 *
 * @example
 * // 110 kg CO₂ saved ÷ 22 kg/tree = 5 trees
 * calculateTreesEquivalent(110); // 5.0
 */
export function calculateTreesEquivalent(co2SavedKg: number): number {
  if (co2SavedKg <= 0) return 0;
  return Number((co2SavedKg / EMISSION_FACTORS.TREE_ABSORPTION_KG_PER_YEAR).toFixed(1));
}

/**
 * Calculates the impact level label and CSS classes for a given monthly footprint.
 * Used for real-time UI feedback in the live estimator widget.
 *
 * @param totalMonthlyKg - Total monthly CO₂e emissions in kg
 * @returns Object with `label`, `color`, and `bg` CSS class strings
 */
export function getImpactLevel(totalMonthlyKg: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (totalMonthlyKg < 200) {
    return {
      label: "Low Impact",
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-200",
    };
  }
  if (totalMonthlyKg < 400) {
    return {
      label: "Moderate",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    };
  }
  return {
    label: "High Impact",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  };
}

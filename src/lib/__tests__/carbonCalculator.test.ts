/**
 * @file src/lib/__tests__/carbonCalculator.test.ts
 * @description Comprehensive unit tests for the carbon calculator utility functions.
 *
 * Coverage: happy paths, edge cases, boundary conditions, and formula validation
 * for all exported functions in carbonCalculator.ts.
 */

import { describe, it, expect } from "vitest";
import {
  calculateTransportationEmissions,
  calculateElectricityEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateScoreAndRating,
  calculateTreesEquivalent,
  getImpactLevel,
  EMISSION_FACTORS,
} from "../carbonCalculator";

// ─── calculateTransportationEmissions ────────────────────────────────────────

describe("calculateTransportationEmissions", () => {
  it("returns 0 when all distances are zero", () => {
    expect(calculateTransportationEmissions(0, 0, 0, 0, 0)).toBe(0);
  });

  it("calculates car emissions correctly (250km × 0.18 = 45.00)", () => {
    expect(calculateTransportationEmissions(250, 0, 0, 0, 0)).toBe(45.0);
  });

  it("calculates bus emissions correctly (100km × 0.08 = 8.00)", () => {
    expect(calculateTransportationEmissions(0, 0, 100, 0, 0)).toBe(8.0);
  });

  it("calculates train emissions correctly (200km × 0.04 = 8.00)", () => {
    expect(calculateTransportationEmissions(0, 0, 0, 200, 0)).toBe(8.0);
  });

  it("calculates flight emissions correctly (1000km × 0.15 = 150.00)", () => {
    expect(calculateTransportationEmissions(0, 0, 0, 0, 1000)).toBe(150.0);
  });

  it("bike distance contributes zero emissions", () => {
    expect(calculateTransportationEmissions(0, 500, 0, 0, 0)).toBe(0);
  });

  it("sums all transport modes correctly", () => {
    // car=250×0.18=45, bike=50×0=0, bus=100×0.08=8, train=50×0.04=2, flight=500×0.15=75
    // Total = 130.00
    expect(calculateTransportationEmissions(250, 50, 100, 50, 500)).toBe(130.0);
  });

  it("returns value rounded to 2 decimal places", () => {
    const result = calculateTransportationEmissions(1, 0, 0, 0, 0);
    expect(result).toBe(0.18);
    expect(Number(result.toFixed(2))).toBe(result);
  });

  it("handles large values without overflow", () => {
    const result = calculateTransportationEmissions(10000, 0, 0, 0, 0);
    expect(result).toBe(1800.0);
  });
});

// ─── calculateElectricityEmissions ───────────────────────────────────────────

describe("calculateElectricityEmissions", () => {
  it("returns 0 for zero kWh", () => {
    expect(calculateElectricityEmissions(0)).toBe(0);
  });

  it("calculates correctly: 150 kWh × 0.45 = 67.50", () => {
    expect(calculateElectricityEmissions(150)).toBe(67.5);
  });

  it("calculates correctly: 500 kWh × 0.45 = 225.00", () => {
    expect(calculateElectricityEmissions(500)).toBe(225.0);
  });

  it("uses the correct global average grid factor", () => {
    expect(EMISSION_FACTORS.electricity).toBe(0.45);
  });

  it("returns value rounded to 2 decimal places", () => {
    const result = calculateElectricityEmissions(3);
    expect(result).toBe(1.35);
  });
});

// ─── calculateFoodEmissions ───────────────────────────────────────────────────

describe("calculateFoodEmissions", () => {
  it("calculates vegetarian emissions: 1.5 × 30.5 = 45.75", () => {
    expect(calculateFoodEmissions("vegetarian")).toBe(45.75);
  });

  it("calculates mixed diet emissions: 2.5 × 30.5 = 76.25", () => {
    expect(calculateFoodEmissions("mixed")).toBe(76.25);
  });

  it("calculates non-vegetarian emissions: 4.0 × 30.5 = 122.00", () => {
    expect(calculateFoodEmissions("non-vegetarian")).toBe(122.0);
  });

  it("non-vegetarian has highest emissions", () => {
    const veg = calculateFoodEmissions("vegetarian");
    const mixed = calculateFoodEmissions("mixed");
    const nonVeg = calculateFoodEmissions("non-vegetarian");
    expect(nonVeg).toBeGreaterThan(mixed);
    expect(mixed).toBeGreaterThan(veg);
  });
});

// ─── calculateWasteEmissions ──────────────────────────────────────────────────

describe("calculateWasteEmissions", () => {
  it("returns 0 for zero waste", () => {
    expect(calculateWasteEmissions(0)).toBe(0);
  });

  it("calculates correctly: 20kg × 0.5 = 10.00", () => {
    expect(calculateWasteEmissions(20)).toBe(10.0);
  });

  it("calculates correctly: 100kg × 0.5 = 50.00", () => {
    expect(calculateWasteEmissions(100)).toBe(50.0);
  });
});

// ─── calculateScoreAndRating ──────────────────────────────────────────────────

describe("calculateScoreAndRating", () => {
  it("returns score 100 for zero emissions", () => {
    const { score, rating } = calculateScoreAndRating(0);
    expect(score).toBe(100);
    expect(rating).toBe("Low Impact");
  });

  it("returns Low Impact for score >= 75 (emissions <= 200)", () => {
    const { score, rating } = calculateScoreAndRating(100);
    expect(score).toBeGreaterThanOrEqual(75);
    expect(rating).toBe("Low Impact");
  });

  it("returns Moderate Impact for score 40-74 (emissions ~250-480)", () => {
    const { score, rating } = calculateScoreAndRating(400);
    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(75);
    expect(rating).toBe("Moderate Impact");
  });

  it("returns High Impact for score < 40 (emissions > 480)", () => {
    const { score, rating } = calculateScoreAndRating(700);
    expect(score).toBeLessThan(40);
    expect(rating).toBe("High Impact");
  });

  it("score never goes below 0", () => {
    const { score } = calculateScoreAndRating(10000);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it("score never exceeds 100", () => {
    const { score } = calculateScoreAndRating(-100);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── calculateTreesEquivalent ─────────────────────────────────────────────────

describe("calculateTreesEquivalent", () => {
  it("returns 0 for zero CO₂ saved", () => {
    expect(calculateTreesEquivalent(0)).toBe(0);
  });

  it("returns 0 for negative CO₂ saved", () => {
    expect(calculateTreesEquivalent(-100)).toBe(0);
  });

  it("calculates correctly: 110 kg ÷ 22 = 5.0 trees", () => {
    expect(calculateTreesEquivalent(110)).toBe(5.0);
  });

  it("calculates correctly: 22 kg = 1 tree", () => {
    expect(calculateTreesEquivalent(22)).toBe(1.0);
  });

  it("rounds to 1 decimal place", () => {
    const result = calculateTreesEquivalent(33);
    expect(result).toBe(1.5);
  });
});

// ─── getImpactLevel ───────────────────────────────────────────────────────────

describe("getImpactLevel", () => {
  it("returns Low Impact for emissions below 200", () => {
    const result = getImpactLevel(150);
    expect(result.label).toBe("Low Impact");
    expect(result.color).toContain("emerald");
  });

  it("returns Moderate for emissions 200-399", () => {
    const result = getImpactLevel(300);
    expect(result.label).toBe("Moderate");
    expect(result.color).toContain("amber");
  });

  it("returns High Impact for emissions >= 400", () => {
    const result = getImpactLevel(500);
    expect(result.label).toBe("High Impact");
    expect(result.color).toContain("red");
  });

  it("returns Low Impact for exactly 0", () => {
    const result = getImpactLevel(0);
    expect(result.label).toBe("Low Impact");
  });

  it("returns Moderate for boundary value 200", () => {
    const result = getImpactLevel(200);
    expect(result.label).toBe("Moderate");
  });
});

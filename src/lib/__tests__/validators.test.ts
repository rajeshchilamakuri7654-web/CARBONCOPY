/**
 * @file src/lib/__tests__/validators.test.ts
 * @description Unit tests for Zod validation schemas and safeValidate utility.
 * Tests valid inputs, invalid inputs, boundary conditions, and error message content.
 */

import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createEmissionSchema,
  createGoalSchema,
  publishArticleSchema,
  safeValidate,
} from "../validators";

// ─── registerSchema ───────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const validData = {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "securepass",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it("normalizes email to lowercase", () => {
    const result = registerSchema.safeParse({ ...validData, email: "Jane@EXAMPLE.COM" });
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
    }
  });

  it("trims whitespace from name", () => {
    const result = registerSchema.safeParse({ ...validData, name: "  Jane Smith  " });
    if (result.success) {
      expect(result.data.name).toBe("Jane Smith");
    }
  });

  it("rejects name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...validData, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({ ...validData, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });
});

// ─── loginSchema ──────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({ password: "password" });
    expect(result.success).toBe(false);
  });
});

// ─── createEmissionSchema ─────────────────────────────────────────────────────

describe("createEmissionSchema", () => {
  const validEmission = {
    carDistance: 200,
    bikeDistance: 50,
    busDistance: 100,
    trainDistance: 30,
    flightDistance: 0,
    electricityKwh: 150,
    foodType: "mixed",
    wasteKg: 20,
  };

  it("accepts valid emission data", () => {
    expect(createEmissionSchema.safeParse(validEmission).success).toBe(true);
  });

  it("accepts all zero values (no activity logged)", () => {
    expect(
      createEmissionSchema.safeParse({
        carDistance: 0,
        bikeDistance: 0,
        busDistance: 0,
        trainDistance: 0,
        flightDistance: 0,
        electricityKwh: 0,
        foodType: "vegetarian",
        wasteKg: 0,
      }).success
    ).toBe(true);
  });

  it("rejects negative car distance", () => {
    const result = createEmissionSchema.safeParse({ ...validEmission, carDistance: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid food type", () => {
    const result = createEmissionSchema.safeParse({ ...validEmission, foodType: "carnivore" });
    expect(result.success).toBe(false);
  });

  it("accepts vegetarian food type", () => {
    const result = createEmissionSchema.safeParse({ ...validEmission, foodType: "vegetarian" });
    expect(result.success).toBe(true);
  });

  it("accepts non-vegetarian food type", () => {
    const result = createEmissionSchema.safeParse({ ...validEmission, foodType: "non-vegetarian" });
    expect(result.success).toBe(true);
  });

  it("rejects negative electricity usage", () => {
    const result = createEmissionSchema.safeParse({ ...validEmission, electricityKwh: -5 });
    expect(result.success).toBe(false);
  });
});

// ─── createGoalSchema ─────────────────────────────────────────────────────────

describe("createGoalSchema", () => {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 1);

  const validGoal = {
    title: "Reduce car driving by 20%",
    category: "transport",
    targetReduction: 20,
    targetValue: 100,
    currentValue: 0,
    endDate: futureDate.toISOString(),
  };

  it("accepts valid goal data", () => {
    expect(createGoalSchema.safeParse(validGoal).success).toBe(true);
  });

  it("rejects title shorter than 3 characters", () => {
    const result = createGoalSchema.safeParse({ ...validGoal, title: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = createGoalSchema.safeParse({ ...validGoal, category: "aviation" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    const categories = ["transport", "electricity", "food", "waste", "overall"];
    for (const category of categories) {
      expect(createGoalSchema.safeParse({ ...validGoal, category }).success).toBe(true);
    }
  });

  it("rejects zero or negative target value", () => {
    const result = createGoalSchema.safeParse({ ...validGoal, targetValue: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects past end date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const result = createGoalSchema.safeParse({ ...validGoal, endDate: pastDate.toISOString() });
    expect(result.success).toBe(false);
  });

  it("rejects target reduction over 100%", () => {
    const result = createGoalSchema.safeParse({ ...validGoal, targetReduction: 150 });
    expect(result.success).toBe(false);
  });
});

// ─── safeValidate ─────────────────────────────────────────────────────────────

describe("safeValidate", () => {
  it("returns success:true with parsed data for valid input", () => {
    const result = safeValidate(loginSchema, {
      email: "test@example.com",
      password: "pass123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("returns success:false with error message for invalid input", () => {
    const result = safeValidate(loginSchema, { email: "bad-email", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTypeOf("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("returns first error message when multiple fields are invalid", () => {
    const result = safeValidate(registerSchema, { name: "", email: "bad", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTypeOf("string");
    }
  });

  it("handles non-object input gracefully", () => {
    const result = safeValidate(loginSchema, null);
    expect(result.success).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("env validation", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws error when NEXTAUTH_SECRET is missing", async () => {
    delete process.env.NEXTAUTH_SECRET;
    
    await expect(async () => {
      await import("../env");
    }).rejects.toThrow(/Invalid environment variables/);
  });

  it("throws error when NEXTAUTH_SECRET is too short", async () => {
    process.env.NEXTAUTH_SECRET = "short"; // < 16 characters
    
    await expect(async () => {
      await import("../env");
    }).rejects.toThrow(/NEXTAUTH_SECRET must be at least 16 characters/);
  });

  it("validates successfully with correct environment variables", async () => {
    process.env.NEXTAUTH_SECRET = "this-is-a-super-secret-key-123456";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    
    const { env } = await import("../env");
    expect(env.NEXTAUTH_SECRET).toBe("this-is-a-super-secret-key-123456");
    expect(env.NEXTAUTH_URL).toBe("http://localhost:3000");
  });
});

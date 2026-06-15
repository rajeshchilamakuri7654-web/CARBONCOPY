import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  prisma: {
    goal: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

describe("Goals API", () => {
  const mockUserId = "test-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/goals", () => {
    it("returns 401 if unauthorized", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const response = await GET({} as any, { params: {} });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentication required");
    });

    it("returns goals for authenticated user", async () => {
      const mockGoals = [{ id: "1", title: "Goal 1" }];
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: mockUserId },
        expires: "123",
      });
      vi.mocked(prisma.goal.findMany).mockResolvedValueOnce(mockGoals as any);

      const response = await GET({} as any, { params: {} });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.goals).toEqual(mockGoals);
      expect(prisma.goal.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { startDate: "desc" },
      });
    });
  });

  describe("POST /api/goals", () => {
    it("returns 401 if unauthorized", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);
      const req = new Request("http://localhost/api/goals", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(req, { params: {} });
      expect(response.status).toBe(401);
    });

    it("creates a goal and awards points", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: mockUserId },
        expires: "123",
      });

      const goalData = {
        title: "Test Goal",
        category: "transport",
        targetReduction: 10,
        targetValue: 100,
        currentValue: 0,
        endDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const req = new Request("http://localhost/api/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });

      const mockCreatedGoal = { id: "new-goal", ...goalData };
      vi.mocked(prisma.goal.create).mockResolvedValueOnce(mockCreatedGoal as any);
      vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

      const response = await POST(req, { params: {} });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.goal).toEqual(mockCreatedGoal);
      expect(prisma.goal.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { points: { increment: 25 } },
      });
    });
  });
});

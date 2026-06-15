/**
 * @file src/types/index.ts
 * @description Central type definitions for the CarbonIQ platform.
 * All domain entities, API response shapes, and UI types are defined here.
 */

// ─── User & Auth ─────────────────────────────────────────────────────────────

/** User role enumeration */
export type UserRole = "USER" | "ADMIN";

/** Core user entity (mirrors Prisma User model) */
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  points: number;
  streak: number;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Authenticated session user shape (extends NextAuth defaults) */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  points: number;
  streak: number;
}

// ─── Emission Records ─────────────────────────────────────────────────────────

/** Impact rating string literal */
export type ImpactRating = "Low Impact" | "Moderate Impact" | "High Impact";

/** Diet / food type enumeration */
export type FoodType = "vegetarian" | "mixed" | "non-vegetarian";

/** Full emission record entity (mirrors Prisma EmissionRecord) */
export interface EmissionRecord {
  id: string;
  userId: string;
  date: string;
  // Transport
  carDistance: number;
  bikeDistance: number;
  busDistance: number;
  trainDistance: number;
  flightDistance: number;
  transportEmissions: number;
  // Electricity
  electricityKwh: number;
  electricityEmissions: number;
  // Food
  foodType: FoodType;
  foodEmissions: number;
  // Waste
  wasteKg: number;
  wasteEmissions: number;
  // Totals
  totalEmissions: number;
  carbonScore: number;
  rating: ImpactRating;
}

/** Payload for creating a new emission record */
export interface CreateEmissionPayload {
  carDistance: number;
  bikeDistance: number;
  busDistance: number;
  trainDistance: number;
  flightDistance: number;
  electricityKwh: number;
  foodType: FoodType;
  wasteKg: number;
}

// ─── Goals ───────────────────────────────────────────────────────────────────

/** Goal category options */
export type GoalCategory = "transport" | "electricity" | "food" | "waste" | "overall";

/** Goal entity (mirrors Prisma Goal model) */
export interface Goal {
  id: string;
  userId: string;
  title: string;
  category: GoalCategory;
  targetReduction: number;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  completed: boolean;
}

/** Payload for creating a new goal */
export interface CreateGoalPayload {
  title: string;
  category: GoalCategory;
  targetReduction: number;
  targetValue: number;
  currentValue: number;
  endDate: string;
}

// ─── Badges ──────────────────────────────────────────────────────────────────

/** User badge entity */
export interface UserBadge {
  id: string;
  userId: string;
  badgeName: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

// ─── Education ───────────────────────────────────────────────────────────────

/** Article category options */
export type ArticleCategory = "General" | "Energy" | "Food" | "Transport" | "Waste";

/** Education article entity */
export interface EducationArticle {
  id: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  content: string;
  reads: number;
  carbonSaved: number;
  createdAt: string;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

/** Leaderboard entry shape */
export interface LeaderboardEntry {
  id: string;
  name: string | null;
  role: UserRole;
  points: number;
  streak: number;
  badgeCount: number;
  latestFootprint: number;
  rank: number;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/** Admin metrics summary */
export interface AdminMetrics {
  totalUsers: number;
  totalLogs: number;
  totalArticles: number;
  avgEmissions: number;
  totalPoints: number;
}

/** Admin user row (includes emission record count) */
export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  points: number;
  streak: number;
  _count: {
    emissionRecords: number;
  };
}

/** Payload for publishing a new article */
export interface PublishArticlePayload {
  title: string;
  category: ArticleCategory;
  summary: string;
  content: string;
  carbonSaved: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

/** Generic success API response wrapper */
export interface ApiSuccess<T> {
  data: T;
  error?: never;
}

/** Generic error API response wrapper */
export interface ApiError {
  error: string;
  data?: never;
}

/** Union API response type */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** Emissions list response */
export interface EmissionsListResponse {
  entries: EmissionRecord[];
}

/** Save emission response */
export interface SaveEmissionResponse {
  record: EmissionRecord;
  pointsEarned: number;
  newStreak: number;
  totalPoints: number;
}

/** Goals list response */
export interface GoalsListResponse {
  goals: Goal[];
}

/** Leaderboard response */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

/** Admin dashboard response */
export interface AdminDashboardResponse {
  metrics: AdminMetrics;
  users: AdminUser[];
}

// ─── Carbon Calculator ────────────────────────────────────────────────────────

/** Result of score calculation */
export interface ScoreAndRating {
  score: number;
  rating: ImpactRating;
}

/** Breakdown of all emission categories */
export interface EmissionsBreakdown {
  transport: number;
  electricity: number;
  food: number;
  waste: number;
  total: number;
}

/** Chart data point for emissions trend */
export interface EmissionChartPoint {
  name: string;
  total: number;
  transport: number;
  electricity: number;
  food: number;
  waste: number;
}

/** Pie chart data slice */
export interface PieChartSlice {
  name: string;
  value: number;
  color: string;
}

// ─── UI / Component Props ─────────────────────────────────────────────────────

/** Impact level display metadata */
export interface ImpactLevel {
  label: string;
  color: string;
  bg: string;
}

/** Trivia fact item */
export interface TriviaItem {
  fact: string;
  source: string;
}

/** Navigation item */
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  protected: boolean;
}

/** Feature card data */
export interface FeatureCard {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  title: string;
  desc: string;
}

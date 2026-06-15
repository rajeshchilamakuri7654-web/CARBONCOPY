/**
 * @file src/types/next-auth.d.ts
 * @description NextAuth type augmentation.
 * Extends the default Session and JWT interfaces to include CarbonIQ-specific
 * user fields (id, role, points, streak), eliminating all `(user as any)` casts.
 */

import type { DefaultSession, DefaultJWT } from "next-auth";
import type { UserRole } from "./index";

declare module "next-auth" {
  /**
   * Augmented Session interface — includes custom user fields returned
   * by the credentials provider and stored in the JWT.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      points: number;
      streak: number;
    } & DefaultSession["user"];
  }

  /**
   * Augmented User interface — shape returned from `authorize()` callback.
   */
  interface User {
    id: string;
    role: UserRole;
    points: number;
    streak: number;
  }
}

declare module "next-auth/jwt" {
  /**
   * Augmented JWT interface — persisted in the session token cookie.
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    points: number;
    streak: number;
  }
}

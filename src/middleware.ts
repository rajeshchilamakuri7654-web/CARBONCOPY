/**
 * @file src/middleware.ts
 * @description Next.js middleware for server-side route protection.
 * Protects authenticated and admin-only routes at the edge layer,
 * before any page/API handler executes. This replaces client-side
 * role checks which can be bypassed.
 */

export { default } from "next-auth/middleware";

export const config = {
  /**
   * Routes that require authentication.
   * - /dashboard: user analytics, requires any logged-in user
   * - /admin: admin portal, additionally checked in the page/API handler for role
   * 
   * Note: /admin role check is also enforced server-side in the API route.
   * The middleware only ensures the user is authenticated at the edge.
   */
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

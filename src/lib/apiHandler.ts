import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Standard API error response format.
 */
interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Context provided to the API handler callback.
 */
export interface ApiContext<TParams = any> {
  req: Request;
  session: Session;
  params?: TParams;
}

/**
 * Standardized Next.js Route Handler wrapper.
 * Provides unified error handling, logging, and authentication checking.
 * 
 * @param handler The asynchronous function containing the business logic.
 * @param options Configuration options (e.g., requireAuth).
 * @returns A standard Next.js route handler function.
 */
export function withApiHandler<TParams = any>(
  handler: (ctx: ApiContext<TParams>) => Promise<NextResponse | Response>,
  options: { requireAuth?: boolean } = { requireAuth: true }
) {
  return async (req: Request, context: any) => {
    try {
      const session = await getServerSession(authOptions);

      if (options.requireAuth && !session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required" } as ApiErrorResponse,
          { status: 401 }
        );
      }

      // Execute the business logic
      return await handler({ req, session: session as Session, params: context.params });
      
    } catch (error: any) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);
      
      // Known error instances (like Prisma, or generic Http errors) could be checked here
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? "Internal Server Error" : error.message;

      return NextResponse.json(
        { error: message } as ApiErrorResponse,
        { status: statusCode }
      );
    }
  };
}

/**
 * @file src/lib/auth.ts
 * @description NextAuth configuration with fully-typed credentials provider.
 * Uses augmented Session/JWT types from next-auth.d.ts to eliminate all
 * unsafe type casts.
 */

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials are present
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Normalize email
        const email = credentials.email.toLowerCase().trim();

        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            points: true,
            streak: true,
          },
        });

        if (!user) {
          throw new Error("No account found with this email address");
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Return typed user object (matches augmented NextAuth User interface)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "USER" | "ADMIN",
          points: user.points,
          streak: user.streak,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT callback: persists custom fields (id, role, points, streak) into the token
     * so they are available in every request without a DB lookup.
     */
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: populate token from user object
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.points = user.points;
        token.streak = user.streak;
      }

      // Session update (e.g., after earning points): sync token fields
      if (trigger === "update" && session) {
        if (session.points !== undefined) token.points = session.points as number;
        if (session.streak !== undefined) token.streak = session.streak as number;
      }

      return token;
    },

    /**
     * Session callback: exposes custom fields to the client via useSession().
     * All fields are fully typed via the next-auth.d.ts augmentation.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.points = token.points;
        session.user.streak = token.streak;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    // Sessions expire after 30 days of inactivity
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

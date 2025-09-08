// Export NextAuth configuration and utilities
export { authOptions, auth, getCurrentUser } from "./nextauth";

// Export types
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

// Re-export NextAuth types for convenience
export type { Session } from "next-auth";
export type { JWT } from "next-auth/jwt";

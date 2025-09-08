// This file is deprecated - using NextAuth instead
// Keeping for backward compatibility during migration

import { env } from "./env.mjs";

export async function getSessionUser() {
  // This function is deprecated, use NextAuth getCurrentUser instead
  console.warn("getSessionUser from clerk.ts is deprecated, use NextAuth getCurrentUser instead");
  return null;
}

/**
 * Supabase Service Role Client
 *
 * This client uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security (RLS).
 *
 * ⚠️ SECURITY WARNING:
 * - ONLY use this client in API routes and server-side code
 * - NEVER expose the service role key to the client
 * - NEVER use this for user-initiated queries without proper authorization checks
 *
 * Use Cases:
 * - Creating organizations and initial memberships (circular RLS reference)
 * - Administrative operations that need to bypass RLS
 * - System-level operations like cleanup, migrations, etc.
 *
 * Pattern:
 * 1. Use regular Supabase client to authenticate user
 * 2. Verify user permissions manually
 * 3. Use service role client to perform operation
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

let serviceRoleClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Creates a Supabase client with service role privileges
 * Bypasses Row Level Security policies
 *
 * @returns Supabase client with admin privileges
 */
export function createServerClient() {
  // Reuse the same client instance (singleton pattern)
  if (serviceRoleClient) {
    return serviceRoleClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. " +
        "This key is required for service role operations. " +
        "Add it to your .env.local file."
    );
  }

  serviceRoleClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceRoleClient;
}

/**
 * Alias for createServerClient for consistency with naming conventions
 */
export const getServiceRoleClient = createServerClient;

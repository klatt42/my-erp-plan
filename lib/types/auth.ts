import type { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  email: string;
}

export interface Session {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

export type UserRole = "admin" | "editor" | "viewer";

export interface OrganizationMember {
  id: string;
  org_id: string;
  user_id: string;
  role: UserRole;
  invited_by: string | null;
  joined_at: string;
  user?: {
    email: string;
    id: string;
  };
}

export interface AuthContext {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
}

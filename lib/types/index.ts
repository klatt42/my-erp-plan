export type { Database, Json } from "./database";
export type { AuthUser, Session, UserRole, OrganizationMember, AuthContext } from "./auth";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, any> | null;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyPlan {
  id: string;
  org_id: string;
  version: string;
  status: "draft" | "review" | "active" | "archived";
  content_json: Record<string, any> | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PlanSection {
  id: string;
  plan_id: string;
  section_type: string;
  content: string;
  order: number;
}

export interface Resource {
  id: string;
  org_id: string;
  resource_type: "personnel" | "equipment" | "facility" | "contact";
  name: string;
  details_json: Record<string, any> | null;
}

export interface EmergencyContact {
  id: string;
  org_id: string;
  name: string;
  role: string;
  phone: string;
  email: string | null;
  priority: number;
}

export interface Incident {
  id: string;
  org_id: string;
  plan_id: string | null;
  status: "active" | "monitoring" | "resolved";
  activated_at: string;
  resolved_at: string | null;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  user_id: string;
  update_type: "status" | "action" | "resource" | "photo" | "note";
  content: string;
  photo_url: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  org_id: string;
  user_id: string;
  action: string;
  details: Record<string, any> | null;
  timestamp: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  tier: "free" | "starter" | "professional" | "enterprise";
  status: "active" | "cancelled" | "past_due" | "trialing";
}

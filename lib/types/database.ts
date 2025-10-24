export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          settings: Json | null;
          tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          settings?: Json | null;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          settings?: Json | null;
          tier?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
      };
      emergency_plans: {
        Row: {
          id: string;
          org_id: string;
          version: string;
          status: string;
          content_json: Json | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          version: string;
          status?: string;
          content_json?: Json | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          version?: string;
          status?: string;
          content_json?: Json | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      plan_sections: {
        Row: {
          id: string;
          plan_id: string;
          section_type: string;
          content: string;
          order: number;
        };
        Insert: {
          id?: string;
          plan_id: string;
          section_type: string;
          content: string;
          order: number;
        };
        Update: {
          id?: string;
          plan_id?: string;
          section_type?: string;
          content?: string;
          order?: number;
        };
      };
      resources: {
        Row: {
          id: string;
          org_id: string;
          resource_type: string;
          name: string;
          details_json: Json | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          resource_type: string;
          name: string;
          details_json?: Json | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          resource_type?: string;
          name?: string;
          details_json?: Json | null;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          role: string;
          phone: string;
          email: string | null;
          priority: number;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          role: string;
          phone: string;
          email?: string | null;
          priority: number;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          role?: string;
          phone?: string;
          email?: string | null;
          priority?: number;
        };
      };
      incidents: {
        Row: {
          id: string;
          org_id: string;
          plan_id: string | null;
          status: string;
          activated_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          plan_id?: string | null;
          status?: string;
          activated_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          plan_id?: string | null;
          status?: string;
          activated_at?: string;
          resolved_at?: string | null;
        };
      };
      incident_updates: {
        Row: {
          id: string;
          incident_id: string;
          user_id: string;
          update_type: string;
          content: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          user_id: string;
          update_type: string;
          content: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          incident_id?: string;
          user_id?: string;
          update_type?: string;
          content?: string;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          action: string;
          details: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          action: string;
          details?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          action?: string;
          details?: Json | null;
          timestamp?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          org_id: string;
          stripe_customer_id: string | null;
          tier: string;
          status: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          stripe_customer_id?: string | null;
          tier: string;
          status: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          stripe_customer_id?: string | null;
          tier?: string;
          status?: string;
        };
      };
    };
  };
}

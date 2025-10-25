/**
 * Emergency Mode View
 * Mobile-optimized interface for active emergency situations
 * - Large, clear action items
 * - Emergency contacts prominently displayed
 * - Checkbox tracking
 * - Works offline once loaded
 */

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EmergencyModeClient } from "@/components/plans/EmergencyModeClient";

interface ERPSection {
  title: string;
  content: string;
  subsections?: Array<{
    title: string;
    content: string;
  }>;
}

interface PlanContent {
  facilityName?: string;
  sections?: ERPSection[];
}

export default async function EmergencyModePage({
  params,
}: {
  params: { orgId: string; planId: string };
}) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: plan } = await supabase
    .from("emergency_plans")
    .select("*")
    .eq("id", params.planId)
    .eq("org_id", params.orgId)
    .single();

  if (!plan) {
    notFound();
  }

  const content = (plan.content_json as PlanContent) || {};

  // Extract emergency contacts
  const contactSection = content.sections?.find((s) =>
    s.title.toLowerCase().includes("contact")
  );

  // Extract emergency scenarios
  const scenarioSection = content.sections?.find((s) =>
    s.title.toLowerCase().includes("scenario") ||
    s.title.toLowerCase().includes("procedure")
  );

  // Extract evacuation info
  const evacuationSection = content.sections?.find((s) =>
    s.title.toLowerCase().includes("evacuation")
  );

  return (
    <EmergencyModeClient
      facilityName={content.facilityName || "Emergency Response Plan"}
      contactSection={contactSection}
      scenarioSection={scenarioSection}
      evacuationSection={evacuationSection}
      planId={params.planId}
      orgId={params.orgId}
    />
  );
}

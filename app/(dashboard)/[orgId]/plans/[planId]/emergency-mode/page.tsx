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

  // Debug: Log available sections
  console.log('[Emergency Mode Server] Available sections:',
    content.sections?.map(s => ({ title: s.title, contentLength: s.content?.length || 0 })) || []
  );

  // Extract emergency contacts - check both content and subsections
  const getContactSection = () => {
    const found = content.sections?.find((s) =>
      s.title.toLowerCase().includes("contact")
    );

    if (!found) return undefined;

    // If has subsections, combine them
    if (found.subsections && found.subsections.length > 0) {
      return {
        ...found,
        content: found.subsections
          .map(sub => sub.content) // Don't include subsection titles for contacts
          .join('\n\n')
      };
    }

    return found;
  };

  const contactSection = getContactSection();

  // Extract emergency scenarios - check both content and subsections
  const getScenarioSection = () => {
    // First, try to find sections with direct content
    let found = content.sections?.find((s) => {
      const title = s.title.toLowerCase();
      const hasContent = s.content && s.content.trim().length > 0;
      return hasContent && (
        title.includes("scenario") ||
        title.includes("procedure") ||
        title.includes("fire") ||
        title.includes("medical") ||
        title.includes("emergency")
      );
    });

    if (found) return found;

    // Look for "Emergency Scenarios" or "Emergency Procedures" section with subsections
    found = content.sections?.find((s) => {
      const title = s.title.toLowerCase();
      const hasSubsections = s.subsections && s.subsections.length > 0;
      const subsectionsHaveContent = s.subsections?.some(sub =>
        sub.content && sub.content.trim().length > 0
      );

      // Match the main emergency scenarios section
      return hasSubsections && subsectionsHaveContent && (
        (title.includes("scenario") && title.includes("response")) ||
        (title.includes("emergency") && title.includes("procedure"))
      );
    });

    if (found && found.subsections) {
      // Find first emergency scenario subsection with actual procedure content
      // Skip title-only subsections (like "FIRE EMERGENCY" with no content)
      const procedureSubsections = found.subsections.filter(sub =>
        sub.content && sub.content.trim().length > 0
      );

      if (procedureSubsections.length > 0) {
        // Take first 5 subsections to get first emergency type's procedures
        const firstFewSubsections = procedureSubsections.slice(0, 5);

        return {
          ...found,
          content: firstFewSubsections
            .map(sub => `### ${sub.title}\n\n${sub.content}`)
            .join('\n\n')
        };
      }
    }

    // If still not found, try top-level fire/medical sections
    found = content.sections?.find((s) => {
      const title = s.title.toLowerCase();
      const hasSubsections = s.subsections && s.subsections.length > 0;
      const subsectionsHaveContent = s.subsections?.some(sub =>
        sub.content && sub.content.trim().length > 0
      );

      return hasSubsections && subsectionsHaveContent && (
        title.includes("fire") ||
        title.includes("medical")
      );
    });

    if (found && found.subsections) {
      return {
        ...found,
        content: found.subsections
          .filter(sub => sub.content && sub.content.trim().length > 0)
          .map(sub => `### ${sub.title}\n\n${sub.content}`)
          .join('\n\n')
      };
    }

    // Fallback to executive summary
    return content.sections?.find((s) => {
      const title = s.title.toLowerCase();
      const hasContent = s.content && s.content.trim().length > 0;
      return hasContent && title.includes("summary");
    });
  };

  const scenarioSection = getScenarioSection();

  console.log('[Emergency Mode Server] Scenario section found:', {
    title: scenarioSection?.title,
    contentLength: scenarioSection?.content?.length || 0,
    contentPreview: scenarioSection?.content?.substring(0, 200)
  });

  // Extract evacuation info - check both content and subsections
  const getEvacuationSection = () => {
    const found = content.sections?.find((s) =>
      s.title.toLowerCase().includes("evacuation")
    );

    if (!found) return undefined;

    // If has subsections, combine them
    if (found.subsections && found.subsections.length > 0) {
      return {
        ...found,
        content: found.subsections
          .map(sub => `### ${sub.title}\n\n${sub.content}`)
          .join('\n\n')
      };
    }

    return found;
  };

  const evacuationSection = getEvacuationSection();

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

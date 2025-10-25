import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SelectivePDFExporter } from "@/lib/pdf/selective-export";

interface ERPSection {
  title: string;
  content: string;
  subsections?: Array<{
    title: string;
    content: string;
  }>;
}

interface PlanContent {
  generatedAt?: string;
  facilityName?: string;
  facilityType?: string;
  version?: string;
  executiveSummary?: string;
  sections?: ERPSection[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const sectionIndex = searchParams.get("section");
    const exportType = searchParams.get("type") || "section"; // section, card, checklist

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the plan
    const { data: plan, error: planError } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("id", params.planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Verify user has access
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .eq("org_id", plan.org_id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You do not have access to this plan" },
        { status: 403 }
      );
    }

    const content = (plan.content_json as PlanContent) || {};
    const facilityName = content.facilityName || "Emergency Response Plan";
    const version = content.version || plan.version;
    const exporter = new SelectivePDFExporter();

    let pdfBuffer: ArrayBuffer;
    let filename: string;

    if (exportType === "card") {
      // Emergency contact wallet card
      pdfBuffer = exporter.exportEmergencyContactCard(content);
      filename = `${facilityName.replace(/[^a-z0-9]/gi, "_")}_emergency_contacts_card.pdf`;
    } else if (exportType === "checklist") {
      // Action checklist
      const emergencyType = searchParams.get("emergencyType") || undefined;
      pdfBuffer = exporter.exportActionChecklist(content, emergencyType);
      filename = `${facilityName.replace(/[^a-z0-9]/gi, "_")}_action_checklist.pdf`;
    } else {
      // Single section
      if (!sectionIndex) {
        return NextResponse.json(
          { error: "Section index required" },
          { status: 400 }
        );
      }

      const index = parseInt(sectionIndex);
      if (isNaN(index) || !content.sections || index >= content.sections.length) {
        return NextResponse.json(
          { error: "Invalid section index" },
          { status: 400 }
        );
      }

      const section = content.sections[index];
      pdfBuffer = exporter.exportSection(section, facilityName, version);
      filename = `${facilityName.replace(/[^a-z0-9]/gi, "_")}_${section.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/plans/[planId]/export-section] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

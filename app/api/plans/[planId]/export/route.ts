import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { ProfessionalPDFExporter } from "@/lib/pdf/professional-export";

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

    // Verify user has access to this plan's organization
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

    // Generate Professional PDF
    const content = (plan.content_json as PlanContent) || {};
    const facilityName = content.facilityName || "Emergency Response Plan";
    const version = content.version || plan.version;

    const exporter = new ProfessionalPDFExporter(facilityName, version);
    const pdfBuffer = exporter.generatePDF(content);

    // Return PDF
    const filename = `${content.facilityName?.replace(/[^a-z0-9]/gi, "_") || "emergency_plan"}_v${plan.version}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/plans/[planId]/export] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

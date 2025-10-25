import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

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

// Helper function to strip markdown formatting for PDF
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
    .replace(/\*(.+?)\*/g, "$1") // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
    .replace(/^#+\s+/gm, "") // Headers
    .replace(/^>\s+/gm, "") // Blockquotes
    .replace(/^[-*+]\s+/gm, "") // Lists
    .replace(/^\d+\.\s+/gm, "") // Numbered lists
    .trim();
}

// Helper function to parse markdown tables
function parseMarkdownTable(text: string): string[][] | null {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const separatorLine = lines[1];

  // Check if it's a markdown table
  if (!headerLine.includes("|") || !separatorLine.includes("-")) return null;

  const table: string[][] = [];

  for (const line of lines) {
    if (line.includes("|") && !line.match(/^[-:|]+$/)) {
      const cells = line
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      table.push(cells);
    }
  }

  return table.length > 0 ? table : null;
}

// Helper function to add text with word wrapping
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 6
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  let currentY = y;

  for (const line of lines) {
    // Check if we need a new page
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
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

    // Generate PDF
    const content = (plan.content_json as PlanContent) || {};
    const doc = new jsPDF();

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = content.facilityName || "Emergency Response Plan";
    yPosition = addWrappedText(doc, title, margin, yPosition, contentWidth, 8);
    yPosition += 5;

    // Metadata
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    let metadata = `Version ${content.version || plan.version}`;
    if (content.facilityType) {
      metadata += ` | ${content.facilityType} Facility`;
    }
    if (content.generatedAt) {
      metadata += ` | Generated ${new Date(content.generatedAt).toLocaleDateString()}`;
    }
    yPosition = addWrappedText(doc, metadata, margin, yPosition, contentWidth);
    yPosition += 10;

    // Executive Summary
    if (content.executiveSummary) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      yPosition = addWrappedText(doc, "Executive Summary", margin, yPosition, contentWidth);
      yPosition += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const summaryText = stripMarkdown(content.executiveSummary);
      yPosition = addWrappedText(doc, summaryText, margin, yPosition, contentWidth);
      yPosition += 10;
    }

    // Sections
    if (content.sections && content.sections.length > 0) {
      for (const section of content.sections) {
        // Check if we need a new page for the section header
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Section title
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        yPosition = addWrappedText(doc, section.title, margin, yPosition, contentWidth);
        yPosition += 5;

        // Section content
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        // Check if content contains a markdown table
        const tableData = parseMarkdownTable(section.content);

        if (tableData && tableData.length > 0) {
          // Render as table
          const colWidth = contentWidth / tableData[0].length;

          for (let i = 0; i < tableData.length; i++) {
            const row = tableData[i];

            // Check if we need a new page
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }

            // Header row styling
            if (i === 0) {
              doc.setFont("helvetica", "bold");
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yPosition - 4, contentWidth, 6, "F");
            } else {
              doc.setFont("helvetica", "normal");
            }

            // Draw cells
            for (let j = 0; j < row.length; j++) {
              const cellX = margin + j * colWidth;
              const cellText = stripMarkdown(row[j]);
              doc.text(cellText, cellX + 2, yPosition, {
                maxWidth: colWidth - 4,
              });
            }

            yPosition += 6;

            // Reset font after header
            if (i === 0) {
              doc.setFont("helvetica", "normal");
            }
          }

          yPosition += 5;
        } else {
          // Render as regular text
          const sectionText = stripMarkdown(section.content);
          yPosition = addWrappedText(doc, sectionText, margin, yPosition, contentWidth);
          yPosition += 8;
        }
      }
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

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

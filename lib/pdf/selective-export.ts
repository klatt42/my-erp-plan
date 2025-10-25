/**
 * Selective Section PDF Export
 * Print individual sections for field use:
 * - Emergency contacts (wallet card)
 * - Evacuation procedures
 * - Quick reference checklist
 */

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

export class SelectivePDFExporter {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 15;
  private yPosition: number = 15;

  constructor(format: "letter" | "card" = "letter") {
    if (format === "card") {
      // Wallet-sized card: 3.5" x 2" (89mm x 51mm)
      this.doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [89, 51],
      });
      this.margin = 3;
    } else {
      this.doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
      });
    }

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/^#+\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*+]\s+/gm, "• ")
      .replace(/^\d+\.\s+/gm, "")
      .trim();
  }

  private parseMarkdownTable(text: string): string[][] | null {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;

    const table: string[][] = [];
    for (const line of lines) {
      if (line.includes("|") && !line.match(/^[-:|]+$/)) {
        const cells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0);
        if (cells.length > 0) table.push(cells);
      }
    }
    return table.length > 0 ? table : null;
  }

  private addText(text: string, fontSize: number = 10, bold: boolean = false): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);

    for (const line of lines) {
      if (this.yPosition > this.pageHeight - this.margin) {
        this.doc.addPage();
        this.yPosition = this.margin;
      }
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += fontSize * 0.5;
    }
  }

  private addTable(tableData: string[][]): void {
    if (tableData.length === 0) return;

    const numColumns = tableData[0].length;
    const colWidth = (this.pageWidth - 2 * this.margin) / numColumns;
    const rowHeight = 6;

    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];

      if (this.yPosition + rowHeight > this.pageHeight - this.margin) {
        this.doc.addPage();
        this.yPosition = this.margin;
      }

      // Header row styling
      if (i === 0) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setFillColor(230, 230, 230);
        this.doc.rect(
          this.margin,
          this.yPosition - 4,
          this.pageWidth - 2 * this.margin,
          rowHeight,
          "F"
        );
      } else {
        this.doc.setFont("helvetica", "normal");
      }

      this.doc.setFontSize(8);
      for (let j = 0; j < row.length; j++) {
        const cellX = this.margin + j * colWidth;
        const cellText = this.stripMarkdown(row[j]);
        this.doc.text(cellText, cellX + 1, this.yPosition, {
          maxWidth: colWidth - 2,
        });
      }

      this.yPosition += rowHeight;
    }
    this.yPosition += 3;
  }

  /**
   * Export Emergency Contacts as Wallet Card
   */
  public exportEmergencyContactCard(content: PlanContent): ArrayBuffer {
    this.doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [89, 51], // Credit card size
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 3;
    this.yPosition = 5;

    // Title
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(200, 0, 0);
    this.doc.text("EMERGENCY CONTACTS", this.pageWidth / 2, this.yPosition, {
      align: "center",
    });
    this.yPosition += 4;

    // Facility name
    this.doc.setFontSize(7);
    this.doc.setTextColor(0);
    this.doc.text(
      content.facilityName || "Emergency Response Plan",
      this.pageWidth / 2,
      this.yPosition,
      { align: "center" }
    );
    this.yPosition += 5;

    // Find contact section
    const contactSection = content.sections?.find((s) =>
      s.title.toLowerCase().includes("contact")
    );

    if (contactSection) {
      const tableData = this.parseMarkdownTable(contactSection.content);

      if (tableData) {
        // Extract emergency services only
        this.doc.setFontSize(6);
        this.doc.setFont("helvetica", "normal");

        const emergencyRows = tableData.filter((row) =>
          row[0]?.toLowerCase().includes("fire") ||
          row[0]?.toLowerCase().includes("police") ||
          row[0]?.toLowerCase().includes("medical") ||
          row[0]?.toLowerCase().includes("911")
        );

        for (const row of emergencyRows) {
          if (this.yPosition > this.pageHeight - 3) break;
          const service = row[0];
          const phone = row[1] || "";
          this.doc.text(`${service}: ${phone}`, this.margin, this.yPosition);
          this.yPosition += 3;
        }
      }
    }

    // Version footer
    this.doc.setFontSize(5);
    this.doc.setTextColor(100);
    this.doc.text(
      `v${content.version || "1.0"} | ${new Date().toLocaleDateString()}`,
      this.pageWidth / 2,
      this.pageHeight - 2,
      { align: "center" }
    );

    return this.doc.output("arraybuffer");
  }

  /**
   * Export Single Section
   */
  public exportSection(
    section: ERPSection,
    facilityName: string,
    version: string
  ): ArrayBuffer {
    // Header
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(facilityName, this.margin, this.yPosition);
    this.yPosition += 8;

    this.doc.setFontSize(12);
    this.doc.text(section.title, this.margin, this.yPosition);
    this.yPosition += 8;

    // Content
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    const tableData = this.parseMarkdownTable(section.content);

    if (tableData) {
      this.addTable(tableData);
    } else {
      const text = this.stripMarkdown(section.content);
      this.addText(text);
    }

    // Footer
    this.doc.setFontSize(8);
    this.doc.setTextColor(100);
    this.doc.text(
      `Version ${version} | Generated: ${new Date().toLocaleDateString()}`,
      this.margin,
      this.pageHeight - 10
    );

    return this.doc.output("arraybuffer");
  }

  /**
   * Export Action Checklist
   */
  public exportActionChecklist(
    content: PlanContent,
    emergencyType?: string
  ): ArrayBuffer {
    // Title
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("EMERGENCY ACTION CHECKLIST", this.margin, this.yPosition);
    this.yPosition += 10;

    // Facility
    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(content.facilityName || "Facility", this.margin, this.yPosition);
    this.yPosition += 6;

    if (emergencyType) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(200, 0, 0);
      this.doc.text(`Emergency Type: ${emergencyType}`, this.margin, this.yPosition);
      this.doc.setTextColor(0);
      this.yPosition += 8;
    } else {
      this.yPosition += 2;
    }

    // Find emergency scenarios section
    const scenarioSection = content.sections?.find((s) =>
      s.title.toLowerCase().includes("scenario") ||
      s.title.toLowerCase().includes("procedure")
    );

    if (scenarioSection) {
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");

      // Extract action items (lines starting with - or numbers)
      const lines = scenarioSection.content.split("\n");
      let actionCount = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("-") || trimmed.match(/^\d+\./)) {
          if (this.yPosition > this.pageHeight - 20) {
            this.doc.addPage();
            this.yPosition = this.margin;
          }

          // Checkbox
          this.doc.rect(this.margin, this.yPosition - 3, 4, 4);

          // Action text
          const actionText = this.stripMarkdown(trimmed);
          const lines = this.doc.splitTextToSize(
            actionText,
            this.pageWidth - this.margin * 2 - 8
          );

          for (const l of lines) {
            this.doc.text(l, this.margin + 6, this.yPosition);
            this.yPosition += 5;
          }

          actionCount++;
          if (actionCount >= 20) break; // Limit to 20 actions
        }
      }
    }

    // Signature section
    this.yPosition = this.pageHeight - 40;
    this.doc.setDrawColor(0);
    this.doc.line(this.margin, this.yPosition, this.pageWidth / 2, this.yPosition);
    this.doc.setFontSize(8);
    this.doc.text("Completed By (Name)", this.margin, this.yPosition + 4);

    this.doc.line(
      this.pageWidth / 2 + 5,
      this.yPosition,
      this.pageWidth - this.margin,
      this.yPosition
    );
    this.doc.text("Date/Time", this.pageWidth / 2 + 5, this.yPosition + 4);

    return this.doc.output("arraybuffer");
  }
}

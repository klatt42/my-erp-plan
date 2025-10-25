/**
 * Professional PDF Export with Print-Ready Formatting
 * Designed for 3-ring binder printing with:
 * - Table of Contents
 * - Headers and Footers
 * - Page Numbers
 * - Section dividers
 * - Professional styling
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

interface TableOfContentsEntry {
  title: string;
  page: number;
  level: number;
}

export class ProfessionalPDFExporter {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 25;
  private headerHeight: number = 15;
  private footerHeight: number = 15;
  private contentWidth: number;
  private contentHeight: number;
  private yPosition: number = 0;
  private currentPage: number = 1;
  private toc: TableOfContentsEntry[] = [];
  private facilityName: string;
  private version: string;

  constructor(facilityName: string, version: string) {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter", // 8.5" x 11" for binder
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - 2 * this.margin;
    this.contentHeight =
      this.pageHeight - this.headerHeight - this.footerHeight - 2 * this.margin;
    this.facilityName = facilityName;
    this.version = version;
  }

  /**
   * Add header to every page
   */
  private addHeader() {
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100);

    // Left side: Facility name
    this.doc.text(this.facilityName, this.margin, 10);

    // Right side: "EMERGENCY RESPONSE PLAN"
    const headerText = "EMERGENCY RESPONSE PLAN";
    const headerWidth = this.doc.getTextWidth(headerText);
    this.doc.text(headerText, this.pageWidth - this.margin - headerWidth, 10);

    // Line under header
    this.doc.setDrawColor(200);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.headerHeight,
      this.pageWidth - this.margin,
      this.headerHeight
    );
  }

  /**
   * Add footer with page numbers
   */
  private addFooter() {
    const footerY = this.pageHeight - 10;

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100);

    // Line above footer
    this.doc.setDrawColor(200);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.pageHeight - this.footerHeight,
      this.pageWidth - this.margin,
      this.pageHeight - this.footerHeight
    );

    // Left side: Version
    this.doc.text(`Version ${this.version}`, this.margin, footerY);

    // Center: Date
    const dateText = `Printed: ${new Date().toLocaleDateString()}`;
    const dateWidth = this.doc.getTextWidth(dateText);
    this.doc.text(dateText, (this.pageWidth - dateWidth) / 2, footerY);

    // Right side: Page number
    const pageText = `Page ${this.currentPage}`;
    const pageWidth = this.doc.getTextWidth(pageText);
    this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, footerY);
  }

  /**
   * Start a new page with header and footer
   */
  private newPage() {
    this.doc.addPage();
    this.currentPage++;
    this.addHeader();
    this.addFooter();
    this.yPosition = this.headerHeight + this.margin;
  }

  /**
   * Check if we need a new page
   */
  private checkPageBreak(requiredSpace: number = 20): boolean {
    const maxY = this.pageHeight - this.footerHeight - this.margin;
    if (this.yPosition + requiredSpace > maxY) {
      this.newPage();
      return true;
    }
    return false;
  }

  /**
   * Add text with word wrapping
   */
  private addText(
    text: string,
    fontSize: number = 10,
    fontStyle: "normal" | "bold" | "italic" = "normal",
    color: number = 0
  ): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", fontStyle);
    this.doc.setTextColor(color);

    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    const lineHeight = fontSize * 0.5;

    for (const line of lines) {
      this.checkPageBreak(lineHeight);
      this.doc.text(line, this.margin, this.yPosition);
      this.yPosition += lineHeight;
    }
  }

  /**
   * Strip markdown formatting
   */
  private stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1") // Bold
      .replace(/\*(.+?)\*/g, "$1") // Italic
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Links
      .replace(/^#+\s+/gm, "") // Headers
      .replace(/^>\s+/gm, "") // Blockquotes
      .replace(/^[-*+]\s+/gm, "• ") // Lists to bullets
      .replace(/^\d+\.\s+/gm, "") // Numbered lists
      .trim();
  }

  /**
   * Parse markdown table
   */
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

  /**
   * Add a formatted table
   */
  private addTable(tableData: string[][]): void {
    if (tableData.length === 0) return;

    const numColumns = tableData[0].length;
    const colWidth = this.contentWidth / numColumns;
    const rowHeight = 7;

    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      this.checkPageBreak(rowHeight);

      // Header row styling
      if (i === 0) {
        this.doc.setFont("helvetica", "bold");
        this.doc.setFillColor(230, 230, 230);
        this.doc.rect(
          this.margin,
          this.yPosition - 5,
          this.contentWidth,
          rowHeight,
          "F"
        );
        this.doc.setTextColor(0);
      } else {
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(40);
      }

      // Draw cells
      for (let j = 0; j < row.length; j++) {
        const cellX = this.margin + j * colWidth;
        const cellText = this.stripMarkdown(row[j]);

        // Draw cell border
        this.doc.setDrawColor(200);
        this.doc.setLineWidth(0.1);
        this.doc.rect(cellX, this.yPosition - 5, colWidth, rowHeight);

        // Draw text
        this.doc.setFontSize(9);
        this.doc.text(cellText, cellX + 2, this.yPosition, {
          maxWidth: colWidth - 4,
        });
      }

      this.yPosition += rowHeight;
    }

    this.yPosition += 5;
  }

  /**
   * Add section with proper formatting
   */
  private addSection(section: ERPSection, level: number = 1): void {
    // Add to TOC
    this.toc.push({
      title: section.title,
      page: this.currentPage,
      level,
    });

    // Section divider for level 1
    if (level === 1) {
      this.checkPageBreak(40);
      this.doc.setDrawColor(0);
      this.doc.setLineWidth(1);
      this.doc.line(
        this.margin,
        this.yPosition,
        this.pageWidth - this.margin,
        this.yPosition
      );
      this.yPosition += 8;
    } else {
      this.checkPageBreak(20);
    }

    // Section title
    const titleFontSize = level === 1 ? 16 : 12;
    this.doc.setFontSize(titleFontSize);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0);
    this.doc.text(section.title, this.margin, this.yPosition);
    this.yPosition += titleFontSize * 0.5 + 3;

    // Section content
    const tableData = this.parseMarkdownTable(section.content);

    if (tableData) {
      this.addTable(tableData);
    } else {
      const contentText = this.stripMarkdown(section.content);
      this.addText(contentText, 10, "normal", 40);
      this.yPosition += 5;
    }

    // Subsections
    if (section.subsections && section.subsections.length > 0) {
      for (const subsection of section.subsections) {
        this.addSection(subsection as ERPSection, level + 1);
      }
    }

    this.yPosition += 3;
  }

  /**
   * Generate cover page
   */
  private generateCoverPage(content: PlanContent): void {
    this.currentPage = 0; // Cover doesn't count
    this.yPosition = this.pageHeight / 3;

    // Title
    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0);
    const title = content.facilityName || "Emergency Response Plan";
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, (this.pageWidth - titleWidth) / 2, this.yPosition);
    this.yPosition += 15;

    // Subtitle
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(80);
    const subtitle = "EMERGENCY RESPONSE PLAN";
    const subtitleWidth = this.doc.getTextWidth(subtitle);
    this.doc.text(
      subtitle,
      (this.pageWidth - subtitleWidth) / 2,
      this.yPosition
    );
    this.yPosition += 10;

    // Version
    this.doc.setFontSize(12);
    const versionText = `Version ${content.version || this.version}`;
    const versionWidth = this.doc.getTextWidth(versionText);
    this.doc.text(
      versionText,
      (this.pageWidth - versionWidth) / 2,
      this.yPosition
    );
    this.yPosition += 30;

    // Facility type
    if (content.facilityType) {
      this.doc.setFontSize(11);
      this.doc.setTextColor(100);
      const facilityText = `${content.facilityType.toUpperCase()} FACILITY`;
      const facilityWidth = this.doc.getTextWidth(facilityText);
      this.doc.text(
        facilityText,
        (this.pageWidth - facilityWidth) / 2,
        this.yPosition
      );
      this.yPosition += 10;
    }

    // Generated date
    this.doc.setFontSize(10);
    const dateText = `Generated: ${content.generatedAt ? new Date(content.generatedAt).toLocaleDateString() : new Date().toLocaleDateString()}`;
    const dateWidth = this.doc.getTextWidth(dateText);
    this.doc.text(dateText, (this.pageWidth - dateWidth) / 2, this.yPosition);
    this.yPosition += 40;

    // Warning box
    this.doc.setDrawColor(200, 0, 0);
    this.doc.setLineWidth(1);
    const boxWidth = this.contentWidth * 0.8;
    const boxX = (this.pageWidth - boxWidth) / 2;
    this.doc.rect(boxX, this.yPosition, boxWidth, 25);

    this.doc.setFontSize(9);
    this.doc.setTextColor(200, 0, 0);
    this.doc.setFont("helvetica", "bold");
    const warningText = "CONFIDENTIAL - FOR EMERGENCY USE ONLY";
    const warningWidth = this.doc.getTextWidth(warningText);
    this.doc.text(
      warningText,
      (this.pageWidth - warningWidth) / 2,
      this.yPosition + 8
    );

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(100);
    const instructions =
      "This document contains critical emergency response procedures.\nKeep in accessible location. Review and update annually.";
    const instructionLines = instructions.split("\n");
    let instructY = this.yPosition + 14;
    for (const line of instructionLines) {
      const lineWidth = this.doc.getTextWidth(line);
      this.doc.text(line, (this.pageWidth - lineWidth) / 2, instructY);
      instructY += 4;
    }
  }

  /**
   * Generate table of contents
   */
  private generateTableOfContents(): void {
    this.newPage();
    this.yPosition = this.headerHeight + this.margin;

    // Title
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(0);
    this.doc.text("TABLE OF CONTENTS", this.margin, this.yPosition);
    this.yPosition += 12;

    // TOC entries
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    for (const entry of this.toc) {
      this.checkPageBreak(8);

      // Indent based on level
      const indent = (entry.level - 1) * 5;
      const entryX = this.margin + indent;

      // Title
      this.doc.text(entry.title, entryX, this.yPosition);

      // Dotted line
      const titleWidth = this.doc.getTextWidth(entry.title);
      const pageNumWidth = this.doc.getTextWidth(entry.page.toString());
      const dotsWidth =
        this.contentWidth - titleWidth - pageNumWidth - indent - 5;
      const dots = ".".repeat(Math.floor(dotsWidth / 1.5));
      this.doc.setTextColor(150);
      this.doc.text(dots, entryX + titleWidth + 2, this.yPosition);

      // Page number
      this.doc.setTextColor(0);
      this.doc.text(
        entry.page.toString(),
        this.pageWidth - this.margin - pageNumWidth,
        this.yPosition
      );

      this.yPosition += 6;
    }
  }

  /**
   * Generate complete professional PDF
   */
  public generatePDF(content: PlanContent): ArrayBuffer {
    // Cover page (no header/footer)
    this.generateCoverPage(content);

    // Start first content page
    this.newPage();
    this.yPosition = this.headerHeight + this.margin;

    // Executive Summary
    if (content.executiveSummary) {
      this.toc.push({
        title: "Executive Summary",
        page: this.currentPage,
        level: 1,
      });

      this.doc.setFontSize(16);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(0);
      this.doc.text("Executive Summary", this.margin, this.yPosition);
      this.yPosition += 10;

      const summaryText = this.stripMarkdown(content.executiveSummary);
      this.addText(summaryText, 10, "normal", 40);
      this.yPosition += 10;
    }

    // Sections
    if (content.sections && content.sections.length > 0) {
      for (const section of content.sections) {
        this.addSection(section);
      }
    }

    // Insert TOC after cover page
    const totalPages = this.currentPage;
    const pdfPages = this.doc.internal.pages;

    // Save current pages
    const contentPages = pdfPages.slice(2); // Skip cover

    // Generate TOC
    this.generateTableOfContents();
    const tocPages = this.doc.internal.pages.slice(totalPages + 1);

    // Reorder: Cover, TOC, Content
    this.doc.internal.pages = [pdfPages[1], ...tocPages, ...contentPages];

    // Update page numbers in TOC (add TOC page count)
    const tocPageCount = tocPages.length;
    for (const entry of this.toc) {
      entry.page += tocPageCount;
    }

    return this.doc.output("arraybuffer");
  }

  /**
   * Get the jsPDF instance for custom operations
   */
  public getDocument(): jsPDF {
    return this.doc;
  }
}

"use client";

/**
 * Selective Export Menu
 * Allows printing individual sections, contact cards, and checklists
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, CreditCard, CheckSquare, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ERPSection {
  title: string;
  content: string;
}

interface SelectiveExportMenuProps {
  planId: string;
  sections: ERPSection[];
  facilityName?: string;
}

export function SelectiveExportMenu({
  planId,
  sections,
  facilityName,
}: SelectiveExportMenuProps) {
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (
    type: "card" | "checklist" | "section",
    sectionIndex?: number
  ) => {
    setIsExporting(true);

    try {
      let url = `/api/plans/${planId}/export-section?type=${type}`;
      if (type === "section" && sectionIndex !== undefined) {
        url += `&section=${sectionIndex}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `export_${type}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `${type === "card" ? "Emergency contact card" : type === "checklist" ? "Action checklist" : "Section"} downloaded`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setShowSectionDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print Options
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Print</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleExport("card")}>
            <CreditCard className="mr-2 h-4 w-4" />
            Emergency Contact Card
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport("checklist")}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Action Checklist
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Print Section</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowSectionDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Select Section...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Section Selection Dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Section to Print</DialogTitle>
            <DialogDescription>
              Print individual sections for field reference
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {sections.map((section, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleExport("section", index)}
                disabled={isExporting}
              >
                <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="line-clamp-2">{section.title}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

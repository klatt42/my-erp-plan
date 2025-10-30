"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/plans/RichTextEditor";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  facilityType?: string;
  version?: string;
  executiveSummary?: string;
  sections?: ERPSection[];
}

export default function PlanEditPage({
  params,
}: {
  params: { orgId: string; planId: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [executiveSummary, setExecutiveSummary] = useState("");
  const [sections, setSections] = useState<ERPSection[]>([]);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/plans/${params.planId}`);

      if (!response.ok) {
        throw new Error("Failed to load plan");
      }

      const data = await response.json();
      const content = (data.plan.content_json as PlanContent) || {};

      setFacilityName(content.facilityName || "");
      setFacilityType(content.facilityType || "");
      setExecutiveSummary(content.executiveSummary || "");
      setSections(content.sections || []);
    } catch (error) {
      console.error("Error loading plan:", error);
      toast.error("Failed to load plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const updatedContent: PlanContent = {
        facilityName,
        facilityType,
        executiveSummary,
        sections,
      };

      const response = await fetch(`/api/plans/${params.planId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_json: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save plan");
      }

      toast.success("Plan saved successfully");
      router.push(`/${params.orgId}/plans/${params.planId}`);
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: "New Section",
        content: "",
        subsections: [],
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (confirm("Are you sure you want to remove this section?")) {
      setSections(sections.filter((_, i) => i !== index));
    }
  };

  const handleSectionChange = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${params.orgId}/plans/${params.planId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plan
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Emergency Plan</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPlan} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="facilityName">Facility Name</Label>
            <Input
              id="facilityName"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              placeholder="Enter facility name"
            />
          </div>
          <div>
            <Label htmlFor="facilityType">Facility Type</Label>
            <Input
              id="facilityType"
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              placeholder="e.g., Healthcare, Commercial, Industrial"
            />
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={executiveSummary}
            onChange={setExecutiveSummary}
            placeholder="Enter executive summary..."
          />
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Plan Sections</h2>
          <Button onClick={handleAddSection} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Input
                  value={section.title}
                  onChange={(e) =>
                    handleSectionChange(index, "title", e.target.value)
                  }
                  className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
                  placeholder="Section Title"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSection(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={section.content}
                onChange={(value) =>
                  handleSectionChange(index, "content", value)
                }
                placeholder="Enter section content..."
              />
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No sections yet. Add your first section to get started.
              </p>
              <Button onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end gap-2 sticky bottom-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border">
        <Button variant="outline" onClick={loadPlan} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

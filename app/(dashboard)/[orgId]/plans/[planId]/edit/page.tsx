"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Eye,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  FileText,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  tokensUsed?: {
    input: number;
    output: number;
    total: number;
  };
}

interface EmergencyPlan {
  id: string;
  org_id: string;
  version: string;
  status: string;
  content_json: PlanContent;
  created_at: string;
  updated_at: string;
}

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const planId = params.planId as string;

  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [content, setContent] = useState<PlanContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}`);
      if (!response.ok) throw new Error("Failed to load plan");

      const data = await response.json();
      const planData = data.plan || data; // Handle both { plan } and direct plan response
      setPlan(planData);
      setContent(planData.content_json || {});
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_json: content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save plan");
      }

      // Show success and redirect back to view
      router.push(`/${orgId}/plans/${planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  const updateExecutiveSummary = (value: string) => {
    setContent({ ...content, executiveSummary: value });
  };

  const updateSection = (index: number, field: keyof ERPSection, value: string) => {
    const sections = [...(content.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setContent({ ...content, sections });
  };

  const updateSubsection = (
    sectionIndex: number,
    subsectionIndex: number,
    field: "title" | "content",
    value: string
  ) => {
    const sections = [...(content.sections || [])];
    const subsections = [...(sections[sectionIndex].subsections || [])];
    subsections[subsectionIndex] = { ...subsections[subsectionIndex], [field]: value };
    sections[sectionIndex] = { ...sections[sectionIndex], subsections };
    setContent({ ...content, sections });
  };

  const addSubsection = (sectionIndex: number) => {
    const sections = [...(content.sections || [])];
    const subsections = [...(sections[sectionIndex].subsections || [])];
    subsections.push({
      title: "New Subsection",
      content: "Enter subsection content here...",
    });
    sections[sectionIndex] = { ...sections[sectionIndex], subsections };
    setContent({ ...content, sections });
  };

  const deleteSubsection = (sectionIndex: number, subsectionIndex: number) => {
    if (!confirm("Are you sure you want to delete this subsection?")) return;

    const sections = [...(content.sections || [])];
    const subsections = [...(sections[sectionIndex].subsections || [])];
    subsections.splice(subsectionIndex, 1);
    sections[sectionIndex] = { ...sections[sectionIndex], subsections };
    setContent({ ...content, sections });
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const sections = [...(content.sections || [])];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= sections.length) return;

    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    setContent({ ...content, sections });

    // Update expanded sections
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
      newExpanded.add(newIndex);
    }
    setExpandedSections(newExpanded);
  };

  const deleteSection = (index: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    const sections = [...(content.sections || [])];
    sections.splice(index, 1);
    setContent({ ...content, sections });

    // Update expanded sections
    const newExpanded = new Set(expandedSections);
    newExpanded.delete(index);
    setExpandedSections(newExpanded);
  };

  const addSection = () => {
    const sections = [...(content.sections || [])];
    sections.push({
      title: "New Section",
      content: "Enter section content here...",
    });
    setContent({ ...content, sections });

    // Expand the new section
    const newExpanded = new Set(expandedSections);
    newExpanded.add(sections.length - 1);
    setExpandedSections(newExpanded);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="text-center">Loading plan...</div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Plan not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (plan.status !== "draft") {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only draft plans can be edited. This plan is currently {plan.status}.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href={`/${orgId}/plans/${planId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Emergency Plan</h1>
          <p className="text-muted-foreground mt-1">
            {content.facilityName || "Emergency Response Plan"} - Version {plan.version}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/${orgId}/plans/${planId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs for Edit/Preview */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">
            <FileText className="mr-2 h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-6 mt-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.executiveSummary || ""}
                onChange={(e) => updateExecutiveSummary(e.target.value)}
                rows={15}
                className="font-mono text-sm"
                placeholder="Enter executive summary..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supports markdown formatting
              </p>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Plan Sections</h2>
              <Button onClick={addSection} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </div>

            {content.sections?.map((section, index) => (
              <Card key={index}>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection(index)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.title || `Section ${index + 1}`}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, "up");
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(index, "down");
                        }}
                        disabled={index === (content.sections?.length || 0) - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(index);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {expandedSections.has(index) && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                      <Input
                        id={`section-title-${index}`}
                        value={section.title}
                        onChange={(e) => updateSection(index, "title", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`section-content-${index}`}>Section Content</Label>
                      <Textarea
                        id={`section-content-${index}`}
                        value={section.content}
                        onChange={(e) => updateSection(index, "content", e.target.value)}
                        rows={12}
                        className="font-mono text-sm mt-1"
                        placeholder="Enter section content..."
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Supports markdown formatting including tables
                      </p>
                    </div>

                    {/* Subsections */}
                    <div className="space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Subsections</Label>
                        <Button
                          onClick={() => addSubsection(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Subsection
                        </Button>
                      </div>

                      {section.subsections?.map((subsection, subIndex) => (
                        <Card key={subIndex} className="bg-muted/50">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">
                                Subsection {subIndex + 1}
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSubsection(index, subIndex)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                            <div>
                              <Label htmlFor={`subsection-title-${index}-${subIndex}`} className="text-xs">
                                Subsection Title
                              </Label>
                              <Input
                                id={`subsection-title-${index}-${subIndex}`}
                                value={subsection.title}
                                onChange={(e) =>
                                  updateSubsection(index, subIndex, "title", e.target.value)
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`subsection-content-${index}-${subIndex}`} className="text-xs">
                                Subsection Content
                              </Label>
                              <Textarea
                                id={`subsection-content-${index}-${subIndex}`}
                                value={subsection.content}
                                onChange={(e) =>
                                  updateSubsection(index, subIndex, "content", e.target.value)
                                }
                                rows={6}
                                className="font-mono text-sm mt-1"
                                placeholder="Enter subsection content..."
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {(!section.subsections || section.subsections.length === 0) && (
                        <p className="text-xs text-muted-foreground italic">
                          No subsections. Click "Add Subsection" to create one.
                        </p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {(!content.sections || content.sections.length === 0) && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <p>No sections yet. Click "Add Section" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6 mt-6">
          {/* Executive Summary Preview */}
          {content.executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content.executiveSummary}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sections Preview */}
          {content.sections && content.sections.length > 0 ? (
            <div className="space-y-6">
              {content.sections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-table:text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>

                      {section.subsections && section.subsections.length > 0 && (
                        <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          {section.subsections.map((subsection, subIndex) => (
                            <div key={subIndex}>
                              <h4 className="font-semibold text-base mb-2">
                                {subsection.title}
                              </h4>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {subsection.content}
                              </ReactMarkdown>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No content to preview</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

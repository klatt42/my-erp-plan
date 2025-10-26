import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Edit, Download, FileText, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DeletePlanButton } from "@/components/plans/DeletePlanButton";
import { ExportPdfButton } from "@/components/plans/ExportPdfButton";
import { ActivatePlanButton } from "@/components/plans/ActivatePlanButton";
import { CreateVersionButton } from "@/components/plans/CreateVersionButton";
import { SectionNavigation } from "@/components/plans/SectionNavigation";
import { SelectiveExportMenu } from "@/components/plans/SelectiveExportMenu";
import RefreshPlanButton from "@/components/plans/RefreshPlanButton";

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

export default async function PlanDetailPage({
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

  // Get user's role in the organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", params.orgId)
    .eq("user_id", user?.id)
    .single();

  const userRole = membership?.role || "viewer";
  const isAdmin = userRole === "admin";

  const content = (plan.content_json as PlanContent) || {};
  const hasSections = content.sections && content.sections.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 pb-20 md:pb-6 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold break-words">
            {content.facilityName || "Emergency Response Plan"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
            <span>Version {content.version || plan.version}</span>
            <span className="hidden sm:inline">•</span>
            <span>Created {formatDate(plan.created_at)}</span>
            {content.facilityType && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="capitalize">{content.facilityType} Facility</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasSections && (
            <SelectiveExportMenu
              planId={params.planId}
              sections={content.sections!}
              facilityName={content.facilityName}
            />
          )}
          <ExportPdfButton planId={params.planId} planName={content.facilityName} />
          <RefreshPlanButton
            planId={params.planId}
            orgId={params.orgId}
            planStatus={plan.status}
            size="sm"
          />
          {plan.status === "draft" && (
            <Button asChild size="sm">
              <Link href={`/${params.orgId}/plans/${params.planId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Link>
            </Button>
          )}
          {(plan.status === "active" || plan.status === "archived") && (
            <CreateVersionButton
              planId={params.planId}
              orgId={params.orgId}
              planName={content.facilityName}
              currentVersion={content.version || plan.version}
            />
          )}
          {isAdmin && (
            <DeletePlanButton
              planId={params.planId}
              orgId={params.orgId}
              planName={content.facilityName}
            />
          )}
        </div>
      </div>

      {/* Status and Emergency Mode */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  plan.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : plan.status === "draft"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                }`}
              >
                {plan.status.toUpperCase()}
              </div>
              {content.tokensUsed && (
                <div className="text-sm text-muted-foreground">
                  Generated using {content.tokensUsed.total.toLocaleString()} AI tokens
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {plan.status === "active" && (
                <Button asChild variant="destructive" size="sm">
                  <Link href={`/${params.orgId}/plans/${params.planId}/emergency-mode`}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Emergency Mode
                  </Link>
                </Button>
              )}
              <ActivatePlanButton
                planId={params.planId}
                planName={content.facilityName}
                currentStatus={plan.status}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {content.executiveSummary && (
        <Card id="section-executive-summary">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-table:text-sm prose-p:text-sm prose-headings:text-base md:prose-headings:text-lg overflow-x-auto">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.executiveSummary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Sections */}
      {hasSections ? (
        <div className="space-y-6">
          {content.sections!.map((section, index) => (
            <Card key={index} id={`section-${index}`}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-3 md:px-6">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-table:text-xs md:prose-table:text-sm prose-p:text-sm prose-headings:text-base md:prose-headings:text-lg prose-ul:text-sm prose-ol:text-sm overflow-x-auto break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-4 md:mt-6 space-y-3 md:space-y-4 pl-3 md:pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h4 className="font-semibold text-sm md:text-base mb-2">
                            {subsection.title}
                          </h4>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{subsection.content}</ReactMarkdown>
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
          <CardHeader>
            <CardTitle>Plan Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No content available. This plan may need to be regenerated.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata Footer */}
      {content.generatedAt && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              <p>Generated on: {new Date(content.generatedAt).toLocaleString()}</p>
              {content.tokensUsed && (
                <p className="mt-1">
                  AI Usage: {content.tokensUsed.input.toLocaleString()} input tokens,{" "}
                  {content.tokensUsed.output.toLocaleString()} output tokens
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Navigation */}
      {hasSections && (
        <SectionNavigation
          sections={content.sections!}
          executiveSummary={content.executiveSummary}
        />
      )}
    </div>
  );
}

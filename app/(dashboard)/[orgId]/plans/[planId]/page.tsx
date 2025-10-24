import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Edit, Download, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  const hasSections = content.sections && content.sections.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {content.facilityName || "Emergency Response Plan"}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Version {content.version || plan.version}</span>
            <span>•</span>
            <span>Created {formatDate(plan.created_at)}</span>
            {content.facilityType && (
              <>
                <span>•</span>
                <span className="capitalize">{content.facilityType} Facility</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          {plan.status === "draft" && (
            <Button asChild size="sm">
              <Link href={`/${params.orgId}/plans/${params.planId}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
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
            {plan.status === "draft" && (
              <Button variant="default" size="sm">
                Activate Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      {content.executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{content.executiveSummary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Sections */}
      {hasSections ? (
        <div className="space-y-6">
          {content.sections!.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{section.content}</ReactMarkdown>

                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex}>
                          <h4 className="font-semibold text-base mb-2">
                            {subsection.title}
                          </h4>
                          <ReactMarkdown>{subsection.content}</ReactMarkdown>
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
    </div>
  );
}

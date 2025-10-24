import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Edit, Download } from "lucide-react";

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

  const generatedContent = (plan.content_json as any)?.generated_content || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Plan v{plan.version}</h1>
          <p className="text-muted-foreground">
            Created on {formatDate(plan.created_at)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
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

      <Card>
        <CardHeader>
          <CardTitle>Plan Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                plan.status === "active"
                  ? "bg-green-100 text-green-800"
                  : plan.status === "draft"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {plan.status.toUpperCase()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {generatedContent}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

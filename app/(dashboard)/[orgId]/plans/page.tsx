import { createClient } from "@/lib/supabase/server";
import { PlanCard } from "@/components/plans/plan-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function PlansPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  const { data: plans } = await supabase
    .from("emergency_plans")
    .select("*")
    .eq("org_id", params.orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emergency Plans</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s emergency response plans
          </p>
        </div>
        <Button asChild>
          <Link href={`/${params.orgId}/plans/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Create plan
          </Link>
        </Button>
      </div>

      {plans && plans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} orgId={params.orgId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <h3 className="text-lg font-medium">No plans yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first emergency response plan to get started
          </p>
          <Button asChild className="mt-4">
            <Link href={`/${params.orgId}/plans/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create plan
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

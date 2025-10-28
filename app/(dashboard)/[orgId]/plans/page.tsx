import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
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

  // Check for multiple active plans and fix them
  const activePlans = plans?.filter(p => p.status === "active") || [];
  if (activePlans.length > 1) {
    console.log(`[PlansPage] WARNING: Found ${activePlans.length} active plans for org ${params.orgId}, fixing...`);

    const serviceSupabase = createServerClient();

    // Keep the most recently activated plan active, archive the rest
    const sortedActive = activePlans.sort((a, b) =>
      new Date(b.activated_at || b.created_at).getTime() -
      new Date(a.activated_at || a.created_at).getTime()
    );

    const idsToArchive = sortedActive.slice(1).map(p => p.id);

    await serviceSupabase
      .from("emergency_plans")
      .update({ status: "archived" } as any)
      .in("id", idsToArchive);

    console.log(`[PlansPage] Archived ${idsToArchive.length} extra active plans`);
  }

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

import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function EditPlanPage({
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

  if (plan.status !== "draft") {
    redirect(`/${params.orgId}/plans/${params.planId}`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Emergency Plan</h1>
        <p className="text-muted-foreground">
          Modify your emergency plan (Version {plan.version})
        </p>
      </div>

      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Plan editor coming soon. For now, you can view the plan details.
        </p>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

export default async function PersonnelPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  const { data: personnel } = await supabase
    .from("resources")
    .select("*")
    .eq("org_id", params.orgId)
    .eq("resource_type", "personnel");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personnel Resources</h1>
        <p className="text-muted-foreground">
          Emergency response personnel and their capabilities
        </p>
      </div>

      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">
          Personnel management interface coming soon
        </p>
      </div>
    </div>
  );
}

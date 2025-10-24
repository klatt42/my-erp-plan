import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Wrench, Building } from "lucide-react";

export default async function ResourcesPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  const [personnelResult, equipmentResult, facilitiesResult] =
    await Promise.all([
      supabase
        .from("resources")
        .select("*", { count: "exact" })
        .eq("org_id", params.orgId)
        .eq("resource_type", "personnel"),
      supabase
        .from("resources")
        .select("*", { count: "exact" })
        .eq("org_id", params.orgId)
        .eq("resource_type", "equipment"),
      supabase
        .from("resources")
        .select("*", { count: "exact" })
        .eq("org_id", params.orgId)
        .eq("resource_type", "facility"),
    ]);

  const resourceTypes = [
    {
      title: "Personnel",
      count: personnelResult.count || 0,
      icon: Users,
      href: `/${params.orgId}/resources/personnel`,
    },
    {
      title: "Equipment",
      count: equipmentResult.count || 0,
      icon: Wrench,
      href: `/${params.orgId}/resources/equipment`,
    },
    {
      title: "Facilities",
      count: facilitiesResult.count || 0,
      icon: Building,
      href: `/${params.orgId}/resources/facilities`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          Manage personnel, equipment, and facilities for emergency response
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {resourceTypes.map((type) => (
          <Link key={type.title} href={type.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{type.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{type.count}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Available resources
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

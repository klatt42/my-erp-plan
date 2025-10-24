import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrgDashboardPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  // Fetch organization stats
  const [plansResult, resourcesResult, membersResult] = await Promise.all([
    supabase
      .from("emergency_plans")
      .select("id", { count: "exact" })
      .eq("org_id", params.orgId),
    supabase
      .from("resources")
      .select("id", { count: "exact" })
      .eq("org_id", params.orgId),
    supabase
      .from("organization_members")
      .select("id", { count: "exact" })
      .eq("org_id", params.orgId),
  ]);

  const stats = [
    {
      title: "Emergency Plans",
      value: plansResult.count || 0,
      icon: FileText,
      href: `/${params.orgId}/plans`,
    },
    {
      title: "Resources",
      value: resourcesResult.count || 0,
      icon: Package,
      href: `/${params.orgId}/resources`,
    },
    {
      title: "Team Members",
      value: membersResult.count || 0,
      icon: Users,
      href: `/${params.orgId}/team`,
    },
    {
      title: "Active Incidents",
      value: 0,
      icon: AlertCircle,
      href: `/${params.orgId}/incidents`,
    },
  ];

  // Fetch recent plans
  const { data: recentPlans } = await supabase
    .from("emergency_plans")
    .select("*")
    .eq("org_id", params.orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your emergency planning status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Plans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Emergency Plans</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href={`/${params.orgId}/plans`}>View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPlans && recentPlans.length > 0 ? (
            <div className="space-y-4">
              {recentPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">Version {plan.version}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {plan.status}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${params.orgId}/plans/${plan.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No plans yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by creating your first emergency plan
              </p>
              <Button asChild className="mt-4">
                <Link href={`/${params.orgId}/plans/new`}>Create plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

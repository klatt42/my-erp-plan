import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/StatsCard";

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
      icon: "FileText" as const,
      href: `/${params.orgId}/plans`,
    },
    {
      title: "Resources",
      value: resourcesResult.count || 0,
      icon: "Package" as const,
      href: `/${params.orgId}/resources`,
    },
    {
      title: "Team Members",
      value: membersResult.count || 0,
      icon: "Users" as const,
      href: `/${params.orgId}/team`,
    },
    {
      title: "Active Incidents",
      value: 0,
      icon: "AlertCircle" as const,
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            href={stat.href}
            index={index}
          />
        ))}
      </div>

      {/* Recent Plans */}
      <Card className="border-gray-200/50 dark:border-gray-700/50 shadow-glass backdrop-blur-xl bg-gradient-to-br from-white/90 to-white/60 dark:from-gray-800/90 dark:to-gray-900/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Recent Emergency Plans</CardTitle>
            <Button asChild variant="outline" size="sm" className="backdrop-blur-sm">
              <Link href={`/${params.orgId}/plans`}>View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPlans && recentPlans.length > 0 ? (
            <div className="space-y-3">
              {recentPlans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/${params.orgId}/plans/${plan.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                      <div className="relative rounded-full bg-primary/10 p-3">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        Version {plan.version}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            plan.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : plan.status === "draft"
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {plan.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                <div className="relative rounded-full bg-primary/10 p-6">
                  <FileText className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="mt-6 text-lg font-medium">No plans yet</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Get started by creating your first emergency response plan
              </p>
              <Button asChild className="mt-6">
                <Link href={`/${params.orgId}/plans/new`}>Create plan</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

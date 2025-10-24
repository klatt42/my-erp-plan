import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function TeamPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("org_id", params.orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s team and permissions
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({members?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              Team management interface coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

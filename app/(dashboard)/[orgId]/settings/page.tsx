import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FacilityResearchButton } from "@/components/research/FacilityResearchButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getFacilityResearch } from "@/app/actions/research-facility";

interface SettingsPageProps {
  params: {
    orgId: string;
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get organization data
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  if (!org) {
    redirect("/");
  }

  // Get cached research data
  const existingResearch = await getFacilityResearch(orgId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Configure your organization's preferences and emergency response data
        </p>
      </div>

      <Separator />

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>
            Basic details about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <p className="text-sm text-muted-foreground mt-1">{org.name}</p>
          </div>

          {org.address && (
            <div>
              <label className="text-sm font-medium">Facility Address</label>
              <p className="text-sm text-muted-foreground mt-1">{org.address}</p>
            </div>
          )}

          {org.industry && (
            <div>
              <label className="text-sm font-medium">Industry</label>
              <p className="text-sm text-muted-foreground mt-1">{org.industry}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Response Research */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Response Research</CardTitle>
          <CardDescription>
            Automatically gather emergency service contacts, local hazards, and facility-specific safety information using AI-powered web research
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">What we'll research:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Nearest emergency services (hospitals, fire, police) with contact info</li>
              <li>Local hazards and environmental risks for your location</li>
              <li>Industry-specific safety regulations and considerations</li>
              <li>Facility context and operations overview</li>
            </ul>
          </div>

          <FacilityResearchButton
            orgId={orgId}
            companyName={org.name}
            address={org.address || `${org.name} location`}
            existingResearch={existingResearch}
          />

          <p className="text-xs text-muted-foreground">
            Research data is automatically saved and will be used to pre-populate emergency plans.
            All auto-generated content should be verified for accuracy.
          </p>
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>
            Manage your billing and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium">Current Plan</label>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {org.subscription_tier || "free"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

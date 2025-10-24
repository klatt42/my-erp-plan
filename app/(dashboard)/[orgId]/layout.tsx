import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has access to this organization
  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("org_id", params.orgId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    redirect("/onboarding");
  }

  return (
    <div className="flex h-screen">
      <Sidebar orgId={params.orgId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userEmail={user.email!} currentOrgId={params.orgId} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

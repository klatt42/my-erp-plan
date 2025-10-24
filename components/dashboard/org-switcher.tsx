"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Organization } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OrgSwitcherProps {
  currentOrgId: string;
}

export function OrgSwitcher({ currentOrgId }: OrgSwitcherProps) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // Fetch organizations the user is a member of
      const { data: members } = await supabase
        .from("organization_members")
        .select("org_id, organizations(*)")
        .eq("user_id", user.id);

      if (members) {
        const orgs = members
          .map((m: any) => m.organizations)
          .filter(Boolean) as Organization[];
        setOrganizations(orgs);

        const current = orgs.find((org) => org.id === currentOrgId);
        setCurrentOrg(current || null);
      }

      setIsLoading(false);
    }

    fetchOrganizations();
  }, [currentOrgId]);

  function handleOrgSwitch(orgId: string) {
    router.push(`/${orgId}`);
  }

  if (isLoading || !currentOrg) {
    return (
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-48 justify-between"
        >
          <span className="truncate">{currentOrg.name}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrgSwitch(org.id)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                currentOrgId === org.id ? "opacity-100" : "opacity-0"
              )}
            />
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GitBranch } from "lucide-react";

interface CreateVersionButtonProps {
  planId: string;
  orgId: string;
  planName?: string;
  currentVersion: string;
}

export function CreateVersionButton({
  planId,
  orgId,
  planName,
  currentVersion,
}: CreateVersionButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateVersion = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}/version`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create new version");
      }

      const { plan: newPlan } = await response.json();

      // Redirect to the new plan
      router.push(`/${orgId}/plans/${newPlan.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create new version");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GitBranch className="mr-2 h-4 w-4" />
          New Version
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Plan Version</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a new draft version of {planName ? `"${planName}"` : "this plan"} based
            on version {currentVersion}. The new version will be editable and the current version
            will remain unchanged.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCreateVersion();
            }}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create New Version"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

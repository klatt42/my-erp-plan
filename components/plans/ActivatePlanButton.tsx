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
import { CheckCircle } from "lucide-react";

interface ActivatePlanButtonProps {
  planId: string;
  planName?: string;
  currentStatus: string;
}

export function ActivatePlanButton({
  planId,
  planName,
  currentStatus,
}: ActivatePlanButtonProps) {
  const router = useRouter();
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    setIsActivating(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to activate plan");
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate plan");
    } finally {
      setIsActivating(false);
    }
  };

  if (currentStatus !== "draft") {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="default" size="sm">
          <CheckCircle className="mr-2 h-4 w-4" />
          Activate Plan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Activate Emergency Plan</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to activate {planName ? `"${planName}"` : "this plan"}? Once
            activated, this plan will be marked as the active emergency response plan and can no
            longer be edited directly. You can create a new version if changes are needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isActivating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleActivate();
            }}
            disabled={isActivating}
          >
            {isActivating ? "Activating..." : "Activate Plan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

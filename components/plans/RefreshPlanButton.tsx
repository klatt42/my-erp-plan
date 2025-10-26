"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface RefreshPlanButtonProps {
  planId: string;
  orgId: string;
  planStatus: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function RefreshPlanButton({
  planId,
  orgId,
  planStatus,
  variant = "outline",
  size = "default",
  className,
}: RefreshPlanButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    action: string;
    message: string;
    newPlanId?: string;
  } | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/plans/${planId}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refresh plan");
      }

      setSuccess({
        action: data.action,
        message: data.message,
        newPlanId: data.action === "new_version" ? data.plan.id : undefined,
      });

      // Auto-redirect after a brief delay
      setTimeout(() => {
        if (data.action === "new_version" && data.plan.id) {
          // Redirect to new version
          router.push(`/${orgId}/plans/${data.plan.id}`);
        } else {
          // Refresh current page
          router.refresh();
        }
        setIsDialogOpen(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh plan");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isDraft = planStatus === "draft";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsDialogOpen(true)}
        className={className}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh Plan
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh Emergency Plan</DialogTitle>
            <DialogDescription>
              {isDraft
                ? "This will regenerate the plan with the latest facility research data and new features, updating the current draft."
                : "This will create a new draft version of the plan with the latest facility research data and new features."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info about what will happen */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">The refreshed plan will include:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Latest facility research data (emergency services, hazards)</li>
                    <li>Updated internal emergency contacts</li>
                    <li>New AI improvements and features</li>
                    <li>Improved formatting and clarity</li>
                  </ul>
                  {!isDraft && (
                    <p className="mt-3 text-sm font-medium">
                      A new version will be created as a draft. Your current {planStatus} version will remain unchanged.
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>

            {/* Error display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success display */}
            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success.message}
                  {success.action === "new_version" && (
                    <p className="mt-1 text-sm">Redirecting to new version...</p>
                  )}
                  {success.action === "updated" && (
                    <p className="mt-1 text-sm">Refreshing page...</p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isRefreshing || !!success}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || !!success}
            >
              {isRefreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRefreshing ? "Refreshing..." : "Refresh Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

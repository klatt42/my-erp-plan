"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplyToEmergencyPlanButtonProps {
  documentId: string;
  orgId: string;
  hasContacts: boolean;
  hasProcedures: boolean;
  hasFacilityInfo: boolean;
  hasEquipment: boolean;
}

export function ApplyToEmergencyPlanButton({
  documentId,
  orgId,
  hasContacts,
  hasProcedures,
  hasFacilityInfo,
  hasEquipment,
}: ApplyToEmergencyPlanButtonProps) {
  const [isApplying, setIsApplying] = useState(false);
  const router = useRouter();

  const hasAnyData = hasContacts || hasProcedures || hasFacilityInfo || hasEquipment;

  const handleApplyToPlan = async () => {
    if (!hasAnyData) return;

    setIsApplying(true);

    try {
      const response = await fetch(`/api/documents/${documentId}/apply-to-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgId }),
      });

      if (!response.ok) {
        throw new Error("Failed to apply data to plan");
      }

      const result = await response.json();

      // Redirect to the plan that was updated
      if (result.planId) {
        router.push(`/${orgId}/plans/${result.planId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Error applying data to plan:", error);
      alert("Failed to apply data to plan. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (!hasAnyData) {
    return null;
  }

  return (
    <button
      onClick={handleApplyToPlan}
      disabled={isApplying}
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isApplying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Applying...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Apply to Emergency Plan
        </>
      )}
    </button>
  );
}

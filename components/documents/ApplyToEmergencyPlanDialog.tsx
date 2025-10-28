"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Users, ClipboardList, Building2, Package, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ApplyToEmergencyPlanDialogProps {
  documentId: string;
  orgId: string;
  hasContacts: boolean;
  hasProcedures: boolean;
  hasFacilityInfo: boolean;
  hasEquipment: boolean;
  contactsCount: number;
  proceduresCount: number;
  equipmentCount: number;
}

export function ApplyToEmergencyPlanDialog({
  documentId,
  orgId,
  hasContacts,
  hasProcedures,
  hasFacilityInfo,
  hasEquipment,
  contactsCount,
  proceduresCount,
  equipmentCount,
}: ApplyToEmergencyPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState({
    contacts: hasContacts,
    procedures: hasProcedures,
    facilityInfo: hasFacilityInfo,
    equipment: hasEquipment,
  });
  const router = useRouter();

  const hasAnyData = hasContacts || hasProcedures || hasFacilityInfo || hasEquipment;

  const toggleSection = (section: keyof typeof selectedSections) => {
    setSelectedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApplyToPlan = async () => {
    // Check if at least one section is selected
    const hasSelection = Object.values(selectedSections).some((v) => v);
    if (!hasSelection) {
      setError("Please select at least one section to apply");
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${documentId}/apply-to-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orgId, selectedSections }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to apply data to plan");
      }

      // Success - redirect to the plan
      if (result.planId) {
        router.push(`/${orgId}/plans/${result.planId}`);
      } else {
        router.refresh();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error applying data to plan:", error);
      setError(error instanceof Error ? error.message : "Failed to apply data to plan. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  if (!hasAnyData) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <CheckCircle2 className="h-4 w-4" />
        Apply to Emergency Plan
      </button>

      {/* Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isApplying && setIsOpen(false)}
          />

          {/* Dialog Content */}
          <div className="relative z-10 w-full max-w-lg mx-4 glass-panel p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Apply to Emergency Plan</h2>
                <p className="text-sm text-muted-foreground">
                  Select which sections you want to add to your emergency plan
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isApplying}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 mb-1">Error</h3>
                  <p className="text-sm text-red-600/80">{error}</p>
                </div>
              </div>
            )}

            {/* Selection Options */}
            <div className="space-y-3 mb-6">
              {/* Contacts */}
              {hasContacts && (
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSections.contacts
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.contacts}
                    onChange={() => toggleSection("contacts")}
                    disabled={isApplying}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold">Contacts</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contactsCount} contact{contactsCount !== 1 ? "s" : ""} with names, titles, and contact information
                    </p>
                  </div>
                </label>
              )}

              {/* Procedures */}
              {hasProcedures && (
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSections.procedures
                      ? "border-green-500 bg-green-500/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.procedures}
                    onChange={() => toggleSection("procedures")}
                    disabled={isApplying}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold">Procedures</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {proceduresCount} procedure{proceduresCount !== 1 ? "s" : ""} with step-by-step instructions
                    </p>
                  </div>
                </label>
              )}

              {/* Facility Info */}
              {hasFacilityInfo && (
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSections.facilityInfo
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.facilityInfo}
                    onChange={() => toggleSection("facilityInfo")}
                    disabled={isApplying}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold">Facility Information</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Building details, utilities, and operating hours
                    </p>
                  </div>
                </label>
              )}

              {/* Equipment */}
              {hasEquipment && (
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedSections.equipment
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.equipment}
                    onChange={() => toggleSection("equipment")}
                    disabled={isApplying}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold">Equipment & Inventory</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipmentCount} equipment item{equipmentCount !== 1 ? "s" : ""} with locations and maintenance schedules
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isApplying}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyToPlan}
                disabled={isApplying}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Apply Selected
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

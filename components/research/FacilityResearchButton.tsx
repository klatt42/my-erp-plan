"use client";

/**
 * Facility Research Button
 * Triggers Perplexity AI research to gather emergency response data
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  researchFacilityData,
  type FacilityResearchData,
} from "@/app/actions/research-facility";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FacilityResearchButtonProps {
  orgId: string;
  companyName: string;
  address: string;
  existingResearch?: FacilityResearchData | null;
  onResearchComplete?: (data: FacilityResearchData) => void;
}

export function FacilityResearchButton({
  orgId,
  companyName,
  address,
  existingResearch,
  onResearchComplete,
}: FacilityResearchButtonProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [researchData, setResearchData] = useState<FacilityResearchData | null>(
    existingResearch || null
  );
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    setIsResearching(true);
    setError(null);

    try {
      const result = await researchFacilityData(orgId, companyName, address);

      if (result.success && result.data) {
        setResearchData(result.data);
        setShowResults(true);
        onResearchComplete?.(result.data);
      } else {
        setError(result.error || "Research failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsResearching(false);
    }
  };

  const getLastResearchedText = () => {
    if (!researchData?.researched_at) return null;

    const date = new Date(researchData.researched_at);
    const daysAgo = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysAgo === 0) return "today";
    if (daysAgo === 1) return "yesterday";
    if (daysAgo < 30) return `${daysAgo} days ago`;
    if (daysAgo < 90) return "recently";
    return "over 90 days ago (consider updating)";
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleResearch}
          disabled={isResearching}
          variant={researchData ? "outline" : "default"}
        >
          {isResearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching facility...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              {researchData ? "Update" : "Research"} Emergency Info
            </>
          )}
        </Button>

        {researchData && !isResearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResults(true)}
          >
            View Results
          </Button>
        )}
      </div>

      {researchData && (
        <p className="text-sm text-muted-foreground mt-2">
          Last researched: {getLastResearchedText()}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive mt-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Facility Research Results</DialogTitle>
            <DialogDescription>
              Emergency information for {companyName} at {address}
            </DialogDescription>
          </DialogHeader>

          {researchData && (
            <div className="space-y-6">
              {/* Emergency Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Services</CardTitle>
                  <CardDescription>
                    Local emergency contacts near your facility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {researchData.emergency_services.length > 0 ? (
                    <div className="space-y-4">
                      {researchData.emergency_services.map((service, idx) => (
                        <div
                          key={idx}
                          className="border-l-4 border-primary pl-4 py-2"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {service.type.replace("_", " ")}
                            </Badge>
                            <h4 className="font-semibold">{service.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {service.address}
                          </p>
                          <p className="text-sm font-medium mt-1">
                            {service.phone}
                          </p>
                          {service.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No emergency services data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Local Hazards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Local Hazards</CardTitle>
                  <CardDescription>
                    Environmental and safety risks for this location
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {researchData.local_hazards.length > 0 ? (
                    <div className="space-y-3">
                      {researchData.local_hazards.map((hazard, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Badge
                            variant={
                              hazard.severity === "high"
                                ? "destructive"
                                : hazard.severity === "medium"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-0.5"
                          >
                            {hazard.severity}
                          </Badge>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {hazard.type}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {hazard.description}
                            </p>
                            {hazard.preparedness_notes && (
                              <p className="text-sm text-primary mt-1">
                                {hazard.preparedness_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hazard data available
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Facility Info */}
              {researchData.facility_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Facility Information</CardTitle>
                    <CardDescription>
                      Business context and safety considerations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {researchData.facility_info.operations_summary && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Operations</h4>
                        <p className="text-sm text-muted-foreground">
                          {researchData.facility_info.operations_summary}
                        </p>
                      </div>
                    )}
                    {researchData.facility_info.estimated_size && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Size</h4>
                        <p className="text-sm text-muted-foreground">
                          {researchData.facility_info.estimated_size}
                        </p>
                      </div>
                    )}
                    {researchData.facility_info.industry_regulations &&
                      researchData.facility_info.industry_regulations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-1">
                            Regulations
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {researchData.facility_info.industry_regulations.map(
                              (reg, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {reg}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}

              {/* Sources */}
              {researchData.sources.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Sources:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {researchData.sources.slice(0, 5).map((source, idx) => (
                      <li key={idx} className="truncate">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p>
                  This data has been automatically populated from online sources.
                  Please verify accuracy and update as needed.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Download,
  Eye,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PlanVersion {
  id: string;
  version: string;
  status: "active" | "draft" | "archived";
  created_at: string;
  created_by: string;
  content_json: any;
}

interface VersionHistoryProps {
  planId: string;
  orgId: string;
  currentVersion: string;
}

export function VersionHistory({
  planId,
  orgId,
  currentVersion,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isExpanded) {
      loadVersions();
    }
  }, [isExpanded]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/plans?orgId=${orgId}`);

      if (!response.ok) {
        throw new Error("Failed to load plan versions");
      }

      const data = await response.json();

      // Filter and sort versions of the same plan
      // In a real implementation, you'd have a parent_plan_id or similar
      // For now, we'll show all plans and sort by version
      const planVersions = data.plans.sort((a: PlanVersion, b: PlanVersion) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setVersions(planVersions);
    } catch (error) {
      console.error("Error loading versions:", error);
      toast.error("Failed to load version history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewVersion = (versionId: string) => {
    router.push(`/${orgId}/plans/${versionId}`);
  };

  const handleRestoreVersion = async (versionId: string, version: string) => {
    if (!confirm(`Are you sure you want to restore version ${version}? This will create a new version based on this one.`)) {
      return;
    }

    try {
      setRestoringVersion(versionId);

      // Create a new version based on the selected version
      const response = await fetch(`/api/plans/${versionId}/version`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to restore version");
      }

      const data = await response.json();
      toast.success(`Version restored successfully as v${data.plan.version}`);

      // Navigate to the new version
      router.push(`/${orgId}/plans/${data.plan.id}`);
    } catch (error) {
      console.error("Error restoring version:", error);
      toast.error("Failed to restore version");
    } finally {
      setRestoringVersion(null);
    }
  };

  const handleDownloadVersion = async (versionId: string, version: string) => {
    try {
      const response = await fetch(`/api/plans/${versionId}/export`);

      if (!response.ok) {
        throw new Error("Failed to export version");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emergency_plan_v${version}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Version exported successfully");
    } catch (error) {
      console.error("Error exporting version:", error);
      toast.error("Failed to export version");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "draft":
        return "bg-blue-500 hover:bg-blue-600";
      case "archived":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className="p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Version History</h3>
          <Badge variant="secondary">{versions.length || "?"} versions</Badge>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Loading version history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No version history available</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Version {version.version}</span>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(version.status)}
                    >
                      {version.status}
                    </Badge>
                    {version.version === currentVersion && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(version.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewVersion(version.id)}
                    title="View this version"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadVersion(version.id, version.version)}
                    title="Download as PDF"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>

                  {version.version !== currentVersion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreVersion(version.id, version.version)}
                      disabled={restoringVersion === version.id}
                      title="Restore this version"
                    >
                      <RotateCcw
                        className={`h-4 w-4 mr-1 ${restoringVersion === version.id ? "animate-spin" : ""}`}
                      />
                      {restoringVersion === version.id ? "Restoring..." : "Restore"}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {versions.length > 0 && (
            <div className="pt-3 border-t text-sm text-muted-foreground">
              <p>
                💡 <strong>Tip:</strong> Click "Restore" to create a new version
                based on a previous one. The current version will be archived.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

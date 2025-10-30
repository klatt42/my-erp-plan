"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, Plus, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

interface Incident {
  id: string;
  org_id: string;
  plan_id: string;
  status: string;
  activated_at: string;
  resolved_at?: string;
}

interface IncidentUpdate {
  id: string;
  incident_id: string;
  user_id: string;
  update_type: string;
  content: string;
  created_at: string;
}

export default function EmergencyModePage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const planId = params.planId as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [updates, setUpdates] = useState<IncidentUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);

  // Update form
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateType, setUpdateType] = useState("note");
  const [updateContent, setUpdateContent] = useState("");

  useEffect(() => {
    loadActiveIncident();
  }, []);

  const loadActiveIncident = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/incidents?orgId=${orgId}&status=active`);
      if (response.ok) {
        const data = await response.json();
        const activeIncident = data.incidents.find((i: Incident) => i.plan_id === planId);
        
        if (activeIncident) {
          setIncident(activeIncident);
          loadUpdates(activeIncident.id);
        }
      }
    } catch (error) {
      console.error("Error loading incident:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUpdates = async (incidentId: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/updates`);
      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates);
      }
    } catch (error) {
      console.error("Error loading updates:", error);
    }
  };

  const handleActivateEmergency = async () => {
    if (!confirm("Activate Emergency Mode? This will notify all team members.")) return;

    try {
      setIsActivating(true);
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, planId }),
      });

      if (response.ok) {
        const data = await response.json();
        setIncident(data.incident);
        toast.success("Emergency Mode activated");
      } else {
        toast.error("Failed to activate Emergency Mode");
      }
    } catch (error) {
      toast.error("Error activating Emergency Mode");
    } finally {
      setIsActivating(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateContent.trim() || !incident) {
      toast.error("Content is required");
      return;
    }

    try {
      const response = await fetch(`/api/incidents/${incident.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          update_type: updateType,
          content: updateContent,
        }),
      });

      if (response.ok) {
        toast.success("Update added");
        setUpdateContent("");
        setShowUpdateForm(false);
        loadUpdates(incident.id);
      } else {
        toast.error("Failed to add update");
      }
    } catch (error) {
      toast.error("Error adding update");
    }
  };

  const handleResolveIncident = async () => {
    if (!incident || !confirm("Resolve this incident?")) return;

    try {
      const response = await fetch(`/api/incidents/${incident.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });

      if (response.ok) {
        toast.success("Incident resolved");
        router.push(`/${orgId}/plans/${planId}`);
      } else {
        toast.error("Failed to resolve incident");
      }
    } catch (error) {
      toast.error("Error resolving incident");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              Emergency Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Emergency Mode is not currently active for this plan. Activate it to begin tracking an emergency incident.
            </p>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleActivateEmergency}
              disabled={isActivating}
            >
              {isActivating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Activate Emergency Mode
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Header */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive animate-pulse" />
              <div>
                <CardTitle>Emergency Mode Active</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Activated: {new Date(incident.activated_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant="destructive" className="text-lg px-4 py-2">
              {incident.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => setShowUpdateForm(!showUpdateForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Update
            </Button>
            <Button variant="outline" onClick={handleResolveIncident}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Resolve Incident
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Update Form */}
      {showUpdateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Incident Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="updateType">Update Type</Label>
              <select
                id="updateType"
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="note">Note</option>
                <option value="action">Action Taken</option>
                <option value="status">Status Change</option>
                <option value="resource">Resource Deployed</option>
              </select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                placeholder="Enter update details..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddUpdate}>Add Update</Button>
              <Button variant="outline" onClick={() => setShowUpdateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Incident Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No updates yet. Add the first update to begin tracking this incident.
            </p>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="flex gap-4 border-l-2 border-muted pl-4 py-2"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{update.update_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(update.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{update.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

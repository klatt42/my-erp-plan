"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Wrench,
  Building,
  Phone,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface Resource {
  id: string;
  org_id: string;
  resource_type: string;
  name: string;
  details_json: any;
}

interface Contact {
  id: string;
  org_id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  priority: number;
}

export default function ResourcesPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personnel");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    details: "",
  });

  useEffect(() => {
    loadResources();
    loadContacts();
  }, []);

  const loadResources = async () => {
    try {
      const response = await fetch(`/api/resources?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/contacts?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleAddResource = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          resource_type: activeTab,
          name: formData.name,
          details_json: { description: formData.details },
        }),
      });

      if (response.ok) {
        toast.success("Resource added successfully");
        setFormData({ name: "", details: "" });
        setShowAddForm(false);
        loadResources();
      } else {
        toast.error("Failed to add resource");
      }
    } catch (error) {
      toast.error("Error adding resource");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Resource deleted");
        loadResources();
      } else {
        toast.error("Failed to delete resource");
      }
    } catch (error) {
      toast.error("Error deleting resource");
    }
  };

  const filteredResources = resources.filter(
    (r) => r.resource_type === activeTab
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-muted-foreground">
            Manage personnel, equipment, facilities, and emergency contacts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personnel">
            <Users className="h-4 w-4 mr-2" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="equipment">
            <Wrench className="h-4 w-4 mr-2" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="facility">
            <Building className="h-4 w-4 mr-2" />
            Facilities
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Phone className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add {activeTab}
            </Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New {activeTab}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <Label htmlFor="details">Details</Label>
                  <Input
                    id="details"
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    placeholder="Enter details"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddResource}>Add</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredResources.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">
                    No {activeTab} resources yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First {activeTab}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="flex items-center justify-between pt-6">
                    <div>
                      <h3 className="font-semibold">{resource.name}</h3>
                      {resource.details_json?.description && (
                        <p className="text-sm text-muted-foreground">
                          {resource.details_json.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

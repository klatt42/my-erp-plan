"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle } from "lucide-react";

const quickPlanSchema = z.object({
  facilityName: z.string().min(1, "Facility name is required"),
  facilityType: z.enum(["office", "warehouse", "manufacturing", "retail", "healthcare", "education", "hospitality", "other"]),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  organizationSize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]),
  hazards: z.array(z.string()).min(1, "Select at least one hazard"),
  complianceRequirements: z.array(z.string()).min(1, "Select at least one compliance framework"),
  prompt: z.string().min(10, "Please provide a detailed description"),
});

type QuickPlanInput = z.infer<typeof quickPlanSchema>;

const HAZARD_OPTIONS = [
  { value: "fire", label: "Fire" },
  { value: "flood", label: "Flood" },
  { value: "earthquake", label: "Earthquake" },
  { value: "tornado", label: "Tornado / Severe Weather" },
  { value: "hurricane", label: "Hurricane" },
  { value: "hazmat", label: "Hazardous Materials" },
  { value: "active_shooter", label: "Active Shooter / Workplace Violence" },
  { value: "medical", label: "Medical Emergency" },
  { value: "power_outage", label: "Power Outage" },
  { value: "cyber", label: "Cybersecurity Incident" },
  { value: "pandemic", label: "Pandemic / Public Health Emergency" },
  { value: "civil_unrest", label: "Civil Unrest" },
  { value: "bomb_threat", label: "Bomb Threat" },
  { value: "biological", label: "Biological Incident" },
];

const COMPLIANCE_OPTIONS = [
  { value: "osha", label: "OSHA (Occupational Safety)" },
  { value: "fema", label: "FEMA (Emergency Management)" },
  { value: "nfpa", label: "NFPA (Fire Safety)" },
  { value: "hipaa", label: "HIPAA (Healthcare Privacy)" },
  { value: "ada", label: "ADA (Accessibility)" },
  { value: "epa", label: "EPA (Environmental)" },
  { value: "jcaho", label: "Joint Commission (Healthcare Accreditation)" },
  { value: "industry", label: "Industry-Specific Standards" },
  { value: "local", label: "Local Building/Fire Codes" },
  { value: "none", label: "General Best Practices" },
];

export default function QuickPlanPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<QuickPlanInput>({
    resolver: zodResolver(quickPlanSchema),
    defaultValues: {
      facilityName: "",
      facilityType: "office",
      city: "",
      state: "",
      organizationSize: "1-10",
      hazards: [],
      complianceRequirements: [],
      prompt: "",
    },
  });

  async function onSubmit(data: QuickPlanInput) {
    setIsGenerating(true);
    setError(null);

    try {
      // Map organization size to the API's expected format
      const sizeMapping: Record<string, "1-10" | "11-50" | "51-200" | "201-1000" | "1000+"> = {
        "1-10": "1-10",
        "11-50": "11-50",
        "51-200": "51-200",
        "201-500": "201-1000",
        "500+": "1000+",
      };

      // Create facility profile matching the FacilityProfile type
      const facilityProfile = {
        name: data.facilityName,
        type: data.facilityType as any,
        size: sizeMapping[data.organizationSize],
        location: {
          city: data.city,
          state: data.state,
        },
        hazards: data.hazards as any[],
        compliance: data.complianceRequirements as any[],
        specialConsiderations: [data.prompt],
      };

      // Call the generate API
      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityProfile, orgId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate plan");
      }

      const responseData = await response.json();
      const planId = responseData.plan?.id || responseData.planId;

      if (!planId) {
        throw new Error("No plan ID returned from server");
      }

      router.push(`/${orgId}/plans/${planId}`);
      router.refresh();
    } catch (err) {
      console.error("Quick plan generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quick Plan Creation</h1>
        <p className="text-muted-foreground">
          Create an emergency plan with essential details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Provide basic information about your facility and emergency planning needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="facilityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp HQ" {...field} disabled={isGenerating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} disabled={isGenerating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} disabled={isGenerating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationSize"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Organization Size *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isGenerating}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hazards"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Primary Hazards *</FormLabel>
                      <FormDescription>
                        Select the emergencies your plan should address
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {HAZARD_OPTIONS.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="hazards"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.value
                                            )
                                          );
                                    }}
                                    disabled={isGenerating}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complianceRequirements"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Compliance Requirements *</FormLabel>
                      <FormDescription>
                        Select applicable regulations and standards
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {COMPLIANCE_OPTIONS.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="complianceRequirements"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.value
                                            )
                                          );
                                    }}
                                    disabled={isGenerating}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details *</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Example: 3-story building with fire sprinklers and emergency exits on each floor. Special considerations for employees with mobility challenges. 24/7 operations."
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide any special considerations, building features, or specific requirements
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/${orgId}/plans/new`)}
                  disabled={isGenerating}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating plan..." : "Generate Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

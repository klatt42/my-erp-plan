/**
 * Step Form Components for Onboarding
 * Individual forms for each step of the questionnaire
 */

"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FacilityTypeSelector } from "./FacilityTypeSelector";
import { HazardChecklist } from "./HazardChecklist";
import type { CompleteOnboarding } from "@/lib/validations/onboarding";

interface StepProps {
  form: UseFormReturn<any>;
  allStepData?: Partial<CompleteOnboarding>;
}

/**
 * Step 1: Organization Information
 */
export function Step1Content({ form }: StepProps) {
  const facilityType = form.watch("type");

  return (
    <div className="space-y-6">
      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Organization Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="e.g., Acme Manufacturing"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message as string}
          </p>
        )}
      </div>

      {/* Facility Type */}
      <div className="space-y-2">
        <Label>
          Facility Type <span className="text-destructive">*</span>
        </Label>
        <FacilityTypeSelector
          value={facilityType}
          onChange={(value) => form.setValue("type", value)}
          customType={form.watch("customType")}
          onCustomTypeChange={(value) => form.setValue("customType", value)}
        />
        {form.formState.errors.type && (
          <p className="text-sm text-destructive">
            {form.formState.errors.type.message as string}
          </p>
        )}
      </div>

      {/* Organization Size */}
      <div className="space-y-2">
        <Label htmlFor="size">
          Organization Size <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.watch("size")}
          onValueChange={(value) => form.setValue("size", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-1000">201-1000 employees</SelectItem>
            <SelectItem value="1000+">1000+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Count */}
      <div className="space-y-2">
        <Label htmlFor="employeeCount">Exact Employee Count (Optional)</Label>
        <Input
          id="employeeCount"
          type="number"
          {...form.register("employeeCount", { valueAsNumber: true })}
          placeholder="e.g., 125"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Street Address (Optional)</Label>
          <Input
            id="address"
            {...form.register("address")}
            placeholder="123 Main St"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input id="city" {...form.register("city")} placeholder="Austin" />
          {form.formState.errors.city && (
            <p className="text-sm text-destructive">
              {form.formState.errors.city.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            {...form.register("state")}
            placeholder="TX"
            maxLength={2}
          />
          {form.formState.errors.state && (
            <p className="text-sm text-destructive">
              {form.formState.errors.state.message as string}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code (Optional)</Label>
          <Input id="zipCode" {...form.register("zipCode")} placeholder="78701" />
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: Facility Details
 */
export function Step2Content({ form }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Building Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="squareFootage">Square Footage</Label>
          <Input
            id="squareFootage"
            type="number"
            {...form.register("squareFootage", { valueAsNumber: true })}
            placeholder="e.g., 50000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floors">Number of Floors</Label>
          <Input
            id="floors"
            type="number"
            {...form.register("floors", { valueAsNumber: true })}
            placeholder="e.g., 3"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buildingAge">Building Age (years)</Label>
          <Input
            id="buildingAge"
            type="number"
            {...form.register("buildingAge", { valueAsNumber: true })}
            placeholder="e.g., 25"
          />
        </div>
      </div>

      {/* Construction Type */}
      <div className="space-y-2">
        <Label htmlFor="construction">Construction Type</Label>
        <Select
          value={form.watch("construction")}
          onValueChange={(value) => form.setValue("construction", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select construction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="concrete">Concrete</SelectItem>
            <SelectItem value="steel">Steel Frame</SelectItem>
            <SelectItem value="wood_frame">Wood Frame</SelectItem>
            <SelectItem value="brick">Brick</SelectItem>
            <SelectItem value="mixed">Mixed Construction</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Safety Systems */}
      <div className="space-y-4">
        <Label>Safety Systems</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasBasement"
              checked={form.watch("hasBasement")}
              onCheckedChange={(checked) => form.setValue("hasBasement", !!checked)}
            />
            <label htmlFor="hasBasement" className="text-sm cursor-pointer">
              Has Basement
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSprinklers"
              checked={form.watch("hasSprinklers")}
              onCheckedChange={(checked) => form.setValue("hasSprinklers", !!checked)}
            />
            <label htmlFor="hasSprinklers" className="text-sm cursor-pointer">
              Has Fire Sprinkler System
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasGenerator"
              checked={form.watch("hasGenerator")}
              onCheckedChange={(checked) => form.setValue("hasGenerator", !!checked)}
            />
            <label htmlFor="hasGenerator" className="text-sm cursor-pointer">
              Has Backup Generator
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSecuritySystem"
              checked={form.watch("hasSecuritySystem")}
              onCheckedChange={(checked) =>
                form.setValue("hasSecuritySystem", !!checked)
              }
            />
            <label htmlFor="hasSecuritySystem" className="text-sm cursor-pointer">
              Has Security System
            </label>
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="space-y-4">
        <Label>Operating Hours</Label>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operatingHoursStandard">Standard Hours</Label>
              <Input
                id="operatingHoursStandard"
                {...form.register("operatingHours.standard")}
                placeholder="e.g., 8am-5pm Mon-Fri"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="twentyFourSeven"
                checked={form.watch("operatingHours.twentyFourSeven")}
                onCheckedChange={(checked) =>
                  form.setValue("operatingHours.twentyFourSeven", !!checked)
                }
              />
              <label htmlFor="twentyFourSeven" className="text-sm cursor-pointer">
                24/7 Operations
              </label>
            </div>

            {form.watch("operatingHours.twentyFourSeven") && (
              <div className="space-y-2">
                <Label htmlFor="shifts">Number of Shifts</Label>
                <Input
                  id="shifts"
                  type="number"
                  {...form.register("operatingHours.shifts", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 3"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Step 3: Collections/Assets
 */
export function Step3Content({ form }: StepProps) {
  const hasCollections = form.watch("hasCollections");

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasCollections"
          checked={hasCollections}
          onCheckedChange={(checked) => form.setValue("hasCollections", !!checked)}
        />
        <label htmlFor="hasCollections" className="text-sm font-medium cursor-pointer">
          This facility has valuable collections, inventory, or critical assets
        </label>
      </div>

      {hasCollections && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe any valuable collections, inventory, or critical assets that require
              special protection during emergencies.
            </p>

            <div className="space-y-2">
              <Label htmlFor="inventoryValue">Overall Inventory Value</Label>
              <Select
                value={form.watch("inventoryValue")}
                onValueChange={(value) => form.setValue("inventoryValue", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select value level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (under $100K)</SelectItem>
                  <SelectItem value="medium">Medium ($100K - $1M)</SelectItem>
                  <SelectItem value="high">High ($1M - $10M)</SelectItem>
                  <SelectItem value="critical">Critical (over $10M)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticalEquipment">
                Critical Equipment (one per line)
              </Label>
              <Textarea
                id="criticalEquipment"
                placeholder="e.g.,&#10;MRI machine&#10;CNC mill&#10;Server racks"
                rows={4}
                onChange={(e) => {
                  const items = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("criticalEquipment", items);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticalSystems">Critical Systems (one per line)</Label>
              <Textarea
                id="criticalSystems"
                placeholder="e.g.,&#10;HVAC system&#10;Security system&#10;Phone system"
                rows={4}
                onChange={(e) => {
                  const items = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("criticalSystems", items);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criticalData">Critical Data (one per line)</Label>
              <Textarea
                id="criticalData"
                placeholder="e.g.,&#10;Customer database&#10;Financial records&#10;Research data"
                rows={4}
                onChange={(e) => {
                  const items = e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  form.setValue("criticalData", items);
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Step 4: Hazard Assessment
 */
export function Step4Content({ form, allStepData }: StepProps) {
  const state = allStepData?.step1?.state;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Emergency Hazards</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select all hazards that could affect your facility. We'll provide
          location-based suggestions.
        </p>
      </div>

      <HazardChecklist
        selectedHazards={form.watch("hazards") || []}
        onChange={(hazards) => form.setValue("hazards", hazards)}
        customHazards={form.watch("customHazards") || []}
        onCustomHazardsChange={(hazards) => form.setValue("customHazards", hazards)}
        state={state}
        locationRisks={form.watch("locationRisks")}
      />

      {form.formState.errors.hazards && (
        <p className="text-sm text-destructive">
          {form.formState.errors.hazards.message as string}
        </p>
      )}

      {/* Risk Level */}
      <div className="space-y-2">
        <Label htmlFor="riskLevel">Overall Risk Level</Label>
        <Select
          value={form.watch("riskLevel")}
          onValueChange={(value) => form.setValue("riskLevel", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select risk level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Existing Plans */}
      <div className="space-y-4">
        <Label>Existing Emergency Plans</Label>
        <div className="space-y-2">
          {[
            { key: "evacuation", label: "Evacuation Plan" },
            { key: "fire", label: "Fire Response Plan" },
            { key: "medical", label: "Medical Emergency Plan" },
            { key: "security", label: "Security Plan" },
            { key: "cyber", label: "Cybersecurity Plan" },
            { key: "business_continuity", label: "Business Continuity Plan" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`existingPlan_${key}`}
                checked={form.watch(`existingPlans.${key}`)}
                onCheckedChange={(checked) =>
                  form.setValue(`existingPlans.${key}`, !!checked)
                }
              />
              <label
                htmlFor={`existingPlan_${key}`}
                className="text-sm cursor-pointer"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Step 5: Team Structure
 */
export function Step5Content({ form }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Personnel Counts */}
      <div>
        <Label className="mb-4 block">Personnel Breakdown</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "management", label: "Management" },
            { key: "staff", label: "Staff" },
            { key: "contractors", label: "Contractors" },
            { key: "volunteers", label: "Volunteers" },
            { key: "visitors", label: "Daily Visitors/Customers" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                {...form.register(key, { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Team */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasEmergencyTeam"
            checked={form.watch("hasEmergencyTeam")}
            onCheckedChange={(checked) =>
              form.setValue("hasEmergencyTeam", !!checked)
            }
          />
          <label htmlFor="hasEmergencyTeam" className="text-sm font-medium cursor-pointer">
            We have a designated emergency response team
          </label>
        </div>
      </div>

      {/* Accessibility */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="accessibilityNeeds"
            checked={form.watch("accessibilityNeeds")}
            onCheckedChange={(checked) =>
              form.setValue("accessibilityNeeds", !!checked)
            }
          />
          <label htmlFor="accessibilityNeeds" className="text-sm font-medium cursor-pointer">
            We have employees/visitors who may need assistance during evacuation
          </label>
        </div>

        {form.watch("accessibilityNeeds") && (
          <Textarea
            {...form.register("accessibilityDetails")}
            placeholder="Describe accessibility needs (e.g., wheelchair users, vision impaired, etc.)"
            rows={3}
          />
        )}
      </div>

      {/* Multilingual Needs */}
      <div className="space-y-2">
        <Label htmlFor="multilingualNeeds">
          Additional Languages Needed (comma-separated)
        </Label>
        <Input
          id="multilingualNeeds"
          placeholder="e.g., Spanish, Chinese, Vietnamese"
          onChange={(e) => {
            const languages = e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            form.setValue("multilingualNeeds", languages);
          }}
        />
      </div>

      {/* Special Considerations */}
      <div className="space-y-2">
        <Label htmlFor="specialConsiderations">
          Special Considerations (one per line)
        </Label>
        <Textarea
          id="specialConsiderations"
          placeholder="Any special considerations for your facility&#10;e.g., nearby hospital, chemical storage, etc."
          rows={4}
          onChange={(e) => {
            const items = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            form.setValue("specialConsiderations", items);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Step 6: Compliance Needs
 */
export function Step6Content({ form }: StepProps) {
  const complianceOptions = [
    { value: "osha", label: "OSHA (Occupational Safety)", description: "Federal workplace safety" },
    { value: "fema", label: "FEMA", description: "Federal emergency management" },
    { value: "nfpa", label: "NFPA", description: "Fire protection standards" },
    { value: "jcaho", label: "Joint Commission (JCAHO)", description: "Healthcare accreditation" },
    { value: "hipaa", label: "HIPAA", description: "Healthcare privacy" },
    { value: "iso_22301", label: "ISO 22301", description: "Business continuity" },
    { value: "iso_31000", label: "ISO 31000", description: "Risk management" },
  ];

  const selectedCompliance = form.watch("compliance") || [];

  const toggleCompliance = (value: string) => {
    if (selectedCompliance.includes(value)) {
      form.setValue(
        "compliance",
        selectedCompliance.filter((c: string) => c !== value)
      );
    } else {
      form.setValue("compliance", [...selectedCompliance, value]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-4 block">
          Compliance Frameworks <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select all compliance frameworks that apply to your facility
        </p>

        <div className="space-y-2">
          {complianceOptions.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-colors ${
                selectedCompliance.includes(option.value)
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => toggleCompliance(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedCompliance.includes(option.value)}
                    onCheckedChange={() => toggleCompliance(option.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {form.formState.errors.compliance && (
          <p className="text-sm text-destructive mt-2">
            {form.formState.errors.compliance.message as string}
          </p>
        )}
      </div>

      {/* State Requirements */}
      <div className="space-y-2">
        <Label htmlFor="stateRequirements">State-Specific Requirements</Label>
        <Textarea
          id="stateRequirements"
          {...form.register("stateRequirements")}
          placeholder="Any state-specific emergency planning requirements"
          rows={3}
        />
      </div>

      {/* Industry Regulations */}
      <div className="space-y-2">
        <Label htmlFor="industryRegulations">Industry Regulations</Label>
        <Textarea
          id="industryRegulations"
          {...form.register("industryRegulations")}
          placeholder="Any industry-specific regulations or standards"
          rows={3}
        />
      </div>

      {/* Insurance Requirements */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="insuranceRequirements"
          checked={form.watch("insuranceRequirements")}
          onCheckedChange={(checked) =>
            form.setValue("insuranceRequirements", !!checked)
          }
        />
        <label htmlFor="insuranceRequirements" className="text-sm cursor-pointer">
          Insurance company requires emergency plan documentation
        </label>
      </div>
    </div>
  );
}

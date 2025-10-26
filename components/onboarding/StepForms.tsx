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
 * Context-aware labels and placeholders based on facility type
 */
export function Step3Content({ form, allStepData }: StepProps) {
  const hasCollections = form.watch("hasCollections");
  const facilityType = allStepData?.step1?.type || "other";

  // Context-aware content based on facility type
  const getAssetContent = () => {
    switch (facilityType) {
      case "museum":
        return {
          checkboxLabel: "This museum has art collections, artifacts, or valuable exhibits",
          description: "Describe your collections, artifacts, and exhibition pieces that require special protection.",
          inventoryLabel: "Collection Value",
          equipmentLabel: "Art Collections & Artifacts (one per line)",
          equipmentPlaceholder: "e.g.,&#10;Renaissance paintings&#10;Ancient pottery&#10;Rare manuscripts&#10;Sculptures",
          systemsLabel: "Environmental Control Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;Climate control system&#10;Humidity monitors&#10;Security cameras&#10;Fire suppression",
          dataLabel: "Critical Records & Archives (one per line)",
          dataPlaceholder: "e.g.,&#10;Collection catalog&#10;Provenance records&#10;Conservation reports&#10;Exhibition schedules"
        };
      case "healthcare":
        return {
          checkboxLabel: "This facility has medical equipment, pharmaceuticals, or patient records",
          description: "Describe medical equipment, pharmaceuticals, and critical patient care assets.",
          inventoryLabel: "Medical Assets Value",
          equipmentLabel: "Medical Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;MRI machine&#10;Ventilators&#10;Surgical equipment&#10;Defibrillators",
          systemsLabel: "Critical Healthcare Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;HVAC with HEPA filtration&#10;Medical gas systems&#10;Nurse call system&#10;EMR system",
          dataLabel: "Critical Patient Data (one per line)",
          dataPlaceholder: "e.g.,&#10;Electronic medical records&#10;Patient charts&#10;Lab results database&#10;Medication records"
        };
      case "manufacturing":
        return {
          checkboxLabel: "This facility has critical production equipment or inventory",
          description: "Describe production equipment, raw materials, and finished goods inventory.",
          inventoryLabel: "Inventory & Equipment Value",
          equipmentLabel: "Production Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;CNC machines&#10;Assembly line robots&#10;Forklifts&#10;Quality control equipment",
          systemsLabel: "Critical Production Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;Compressed air system&#10;Electrical distribution&#10;HVAC system&#10;Conveyor systems",
          dataLabel: "Critical Production Data (one per line)",
          dataPlaceholder: "e.g.,&#10;Production schedules&#10;Quality control records&#10;Customer orders&#10;Inventory tracking"
        };
      case "datacenter":
        return {
          checkboxLabel: "This facility has servers, networking equipment, or critical infrastructure",
          description: "Describe server hardware, networking equipment, and data storage systems.",
          inventoryLabel: "IT Equipment Value",
          equipmentLabel: "Critical IT Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;Server racks&#10;Network switches&#10;Storage arrays&#10;Firewall appliances",
          systemsLabel: "Infrastructure Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;Cooling/HVAC system&#10;UPS batteries&#10;Backup generators&#10;Fire suppression",
          dataLabel: "Critical Data & Services (one per line)",
          dataPlaceholder: "e.g.,&#10;Customer databases&#10;Application servers&#10;Backup systems&#10;Network configuration"
        };
      case "retail":
        return {
          checkboxLabel: "This facility has merchandise inventory or point-of-sale systems",
          description: "Describe merchandise, inventory, and retail equipment.",
          inventoryLabel: "Merchandise Value",
          equipmentLabel: "Retail Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;Point-of-sale systems&#10;Cash registers&#10;Security cameras&#10;Display fixtures",
          systemsLabel: "Store Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;Inventory management system&#10;Security system&#10;HVAC system&#10;Payment processing",
          dataLabel: "Critical Business Data (one per line)",
          dataPlaceholder: "e.g.,&#10;Sales records&#10;Inventory database&#10;Customer loyalty data&#10;Financial transactions"
        };
      case "educational":
        return {
          checkboxLabel: "This facility has educational equipment, technology, or valuable resources",
          description: "Describe educational technology, equipment, and learning resources.",
          inventoryLabel: "Equipment & Resources Value",
          equipmentLabel: "Educational Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;Computer labs&#10;Science lab equipment&#10;Musical instruments&#10;Sports equipment",
          systemsLabel: "Facility Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;Network infrastructure&#10;Security/access control&#10;Audio-visual systems&#10;HVAC system",
          dataLabel: "Critical Educational Data (one per line)",
          dataPlaceholder: "e.g.,&#10;Student records&#10;Curriculum materials&#10;Library catalog&#10;Assessment data"
        };
      default:
        return {
          checkboxLabel: "This facility has valuable collections, inventory, or critical assets",
          description: "Describe any valuable collections, inventory, or critical assets that require special protection during emergencies.",
          inventoryLabel: "Overall Asset Value",
          equipmentLabel: "Critical Equipment (one per line)",
          equipmentPlaceholder: "e.g.,&#10;Essential machinery&#10;Specialized tools&#10;Technology systems",
          systemsLabel: "Critical Systems (one per line)",
          systemsPlaceholder: "e.g.,&#10;HVAC system&#10;Security system&#10;Communication system",
          dataLabel: "Critical Data (one per line)",
          dataPlaceholder: "e.g.,&#10;Business records&#10;Customer data&#10;Financial information"
        };
    }
  };

  const content = getAssetContent();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasCollections"
          checked={hasCollections}
          onCheckedChange={(checked) => form.setValue("hasCollections", !!checked)}
        />
        <label htmlFor="hasCollections" className="text-sm font-medium cursor-pointer">
          {content.checkboxLabel}
        </label>
      </div>

      {hasCollections && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              {content.description}
            </p>

            <div className="space-y-2">
              <Label htmlFor="inventoryValue">{content.inventoryLabel}</Label>
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
                {content.equipmentLabel}
              </Label>
              <Textarea
                id="criticalEquipment"
                placeholder={content.equipmentPlaceholder}
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
              <Label htmlFor="criticalSystems">{content.systemsLabel}</Label>
              <Textarea
                id="criticalSystems"
                placeholder={content.systemsPlaceholder}
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
              <Label htmlFor="criticalData">{content.dataLabel}</Label>
              <Textarea
                id="criticalData"
                placeholder={content.dataPlaceholder}
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
 * Personnel breakdown for emergency response planning
 */
export function Step5Content({ form }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Explanatory intro */}
      <div className="p-4 bg-muted/50 rounded-md border">
        <p className="text-sm text-muted-foreground">
          This information helps us create appropriate emergency procedures, evacuation plans, and assign roles.
          Categories help identify who needs specific emergency training, evacuation assistance, or accountability during incidents.
        </p>
      </div>

      {/* Personnel Counts */}
      <div>
        <Label className="mb-4 block">Personnel Breakdown</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Estimate the number of people in each category. These numbers help determine evacuation time, assembly areas, and emergency team sizing.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              key: "management",
              label: "Management",
              help: "Decision-makers & supervisors who will lead emergency response"
            },
            {
              key: "staff",
              label: "Staff",
              help: "Full-time and part-time employees"
            },
            {
              key: "contractors",
              label: "Contractors/Vendors",
              help: "Regular on-site contractors or vendors"
            },
            {
              key: "volunteers",
              label: "Volunteers",
              help: "Volunteers or interns (if applicable)"
            },
            {
              key: "visitors",
              label: "Daily Visitors/Customers",
              help: "Average number of visitors, customers, or guests per day"
            },
          ].map(({ key, label, help }) => (
            <div key={key} className="space-y-2">
              <div>
                <Label htmlFor={key}>{label}</Label>
                <p className="text-xs text-muted-foreground mt-1">{help}</p>
              </div>
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

      {/* Internal Emergency Contacts */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <Label className="text-lg font-medium">Internal Emergency Contacts</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Key personnel who should be contacted during emergencies
          </p>
        </div>

        {/* Emergency Coordinator */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-semibold">Emergency Coordinator *</h4>
            <p className="text-sm text-muted-foreground">
              Primary person responsible for emergency response and plan activation
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyCoordinator.name">Full Name *</Label>
                <Input
                  id="emergencyCoordinator.name"
                  {...form.register("emergencyCoordinator.name")}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyCoordinator.title">Title/Position</Label>
                <Input
                  id="emergencyCoordinator.title"
                  {...form.register("emergencyCoordinator.title")}
                  placeholder="Safety Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyCoordinator.phone">Phone Number *</Label>
                <Input
                  id="emergencyCoordinator.phone"
                  {...form.register("emergencyCoordinator.phone")}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyCoordinator.email">Email Address *</Label>
                <Input
                  id="emergencyCoordinator.email"
                  type="email"
                  {...form.register("emergencyCoordinator.email")}
                  placeholder="john@company.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternate Emergency Contact */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-semibold">Alternate Emergency Contact</h4>
            <p className="text-sm text-muted-foreground">
              Backup contact if primary coordinator is unavailable
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alternateContact.name">Full Name</Label>
                <Input
                  id="alternateContact.name"
                  {...form.register("alternateContact.name")}
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternateContact.title">Title/Position</Label>
                <Input
                  id="alternateContact.title"
                  {...form.register("alternateContact.title")}
                  placeholder="Assistant Manager"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternateContact.phone">Phone Number</Label>
                <Input
                  id="alternateContact.phone"
                  {...form.register("alternateContact.phone")}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternateContact.email">Email Address</Label>
                <Input
                  id="alternateContact.email"
                  type="email"
                  {...form.register("alternateContact.email")}
                  placeholder="jane@company.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facility Manager */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h4 className="font-semibold">Facility Manager</h4>
            <p className="text-sm text-muted-foreground">
              Contact for building/facility-specific emergencies
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facilityManager.name">Full Name</Label>
                <Input
                  id="facilityManager.name"
                  {...form.register("facilityManager.name")}
                  placeholder="Bob Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facilityManager.phone">Phone Number</Label>
                <Input
                  id="facilityManager.phone"
                  {...form.register("facilityManager.phone")}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emergency Team */}
      <div className="space-y-4 pt-6 border-t">
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
                  <div className={`h-4 w-4 rounded border-2 flex-shrink-0 mt-0.5 transition-colors ${
                    selectedCompliance.includes(option.value)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {selectedCompliance.includes(option.value) && (
                      <svg
                        className="h-full w-full text-primary-foreground"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="3,8 6,11 13,4" />
                      </svg>
                    )}
                  </div>
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

      {/* Emergency Contacts - Support Services */}
      <div className="space-y-4 pt-6 border-t">
        <div>
          <Label className="text-lg font-medium">Emergency Support Services</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-designated contractors for emergency response and recovery
          </p>
        </div>

        {/* Mitigation Contractor */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium">Mitigation Contractor</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mitigationContractor">Company Name</Label>
              <Input
                id="mitigationContractor"
                {...form.register("mitigationContractor")}
                placeholder="e.g., Prism Specialties"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitigationContractorPhone">Phone Number</Label>
              <Input
                id="mitigationContractorPhone"
                {...form.register("mitigationContractorPhone")}
                placeholder="e.g., 301-955-0885"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="mitigationContractorContact">Primary Contact Person</Label>
              <Input
                id="mitigationContractorContact"
                {...form.register("mitigationContractorContact")}
                placeholder="e.g., John Smith"
              />
            </div>
          </div>
        </div>

        {/* Specialty Contents Contractor */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium">Specialty Contents Contractor</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialtyContentsContractor">Company Name</Label>
              <Input
                id="specialtyContentsContractor"
                {...form.register("specialtyContentsContractor")}
                defaultValue="Prism Specialties of DC, MD, and VA Metro"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialtyContentsContractorPhone">Phone Number</Label>
              <Input
                id="specialtyContentsContractorPhone"
                {...form.register("specialtyContentsContractorPhone")}
                defaultValue="301-955-0885"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specialtyContentsContractorContact">Primary Contact Person</Label>
              <Input
                id="specialtyContentsContractorContact"
                {...form.register("specialtyContentsContractorContact")}
                defaultValue="Mike Cioffi"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

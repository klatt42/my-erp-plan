/**
 * Facility Type Selector Component
 * Visual selector for different facility types with icons and descriptions
 */

"use client";

import { useState } from "react";
import {
  Building2,
  Factory,
  ShoppingBag,
  Landmark,
  GraduationCap,
  Hotel,
  Server,
  FlaskConical,
  Cross,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FacilityType =
  | "healthcare"
  | "manufacturing"
  | "office"
  | "retail"
  | "museum"
  | "educational"
  | "hospitality"
  | "datacenter"
  | "laboratory"
  | "other";

interface FacilityOption {
  value: FacilityType;
  label: string;
  description: string;
  icon: React.ElementType;
}

const FACILITY_OPTIONS: FacilityOption[] = [
  {
    value: "healthcare",
    label: "Healthcare",
    description: "Hospitals, clinics, urgent care",
    icon: Cross,
  },
  {
    value: "manufacturing",
    label: "Manufacturing",
    description: "Industrial facilities, plants",
    icon: Factory,
  },
  {
    value: "office",
    label: "Office",
    description: "Corporate buildings, headquarters",
    icon: Building2,
  },
  {
    value: "retail",
    label: "Retail",
    description: "Stores, shopping centers",
    icon: ShoppingBag,
  },
  {
    value: "museum",
    label: "Museum",
    description: "Museums, galleries, archives",
    icon: Landmark,
  },
  {
    value: "educational",
    label: "Educational",
    description: "Schools, universities, training",
    icon: GraduationCap,
  },
  {
    value: "hospitality",
    label: "Hospitality",
    description: "Hotels, restaurants, venues",
    icon: Hotel,
  },
  {
    value: "datacenter",
    label: "Data Center",
    description: "Colocation, enterprise servers",
    icon: Server,
  },
  {
    value: "laboratory",
    label: "Laboratory",
    description: "Research, testing, clinical",
    icon: FlaskConical,
  },
  {
    value: "other",
    label: "Other",
    description: "Custom facility type",
    icon: LayoutGrid,
  },
];

interface FacilityTypeSelectorProps {
  value: FacilityType;
  onChange: (value: FacilityType) => void;
  customType?: string;
  onCustomTypeChange?: (value: string) => void;
}

export function FacilityTypeSelector({
  value,
  onChange,
  customType,
  onCustomTypeChange,
}: FacilityTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {FACILITY_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <Card
              key={option.value}
              className={cn(
                "cursor-pointer transition-all hover:border-primary hover:shadow-md",
                isSelected && "border-primary bg-primary/5 shadow-md"
              )}
              onClick={() => onChange(option.value)}
            >
              <CardContent className="p-4 text-center">
                <Icon
                  className={cn(
                    "mx-auto mb-2 h-8 w-8 text-muted-foreground",
                    isSelected && "text-primary"
                  )}
                />
                <h3
                  className={cn(
                    "text-sm font-medium",
                    isSelected && "text-primary"
                  )}
                >
                  {option.label}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom type input when "Other" is selected */}
      {value === "other" && (
        <div className="space-y-2 p-4 border rounded-md bg-muted/50">
          <Label htmlFor="customType">
            Specify your facility type <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customType"
            placeholder="e.g., Warehouse, Library, Community Center, Theater"
            value={customType || ""}
            onChange={(e) => onCustomTypeChange?.(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Please describe your facility type. This helps us generate a more accurate emergency response plan.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Get facility type label
 */
export function getFacilityTypeLabel(type: FacilityType): string {
  return FACILITY_OPTIONS.find((opt) => opt.value === type)?.label || type;
}

/**
 * Get facility type description
 */
export function getFacilityTypeDescription(type: FacilityType): string {
  return (
    FACILITY_OPTIONS.find((opt) => opt.value === type)?.description ||
    "Custom facility"
  );
}

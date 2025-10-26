/**
 * Hazard Checklist Component
 * Multi-select checklist for emergency hazards with location-based suggestions
 */

"use client";

import { useState } from "react";
import {
  Flame,
  Droplets,
  Activity,
  Wind,
  Cloud,
  Zap,
  Skull,
  Radiation,
  Bomb,
  AlertTriangle,
  Target,
  Wifi,
  Power,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HazardType =
  | "fire"
  | "flood"
  | "earthquake"
  | "tornado"
  | "hurricane"
  | "chemical"
  | "biological"
  | "radiological"
  | "explosion"
  | "hazmat"
  | "active_shooter"
  | "cyberattack"
  | "power_outage"
  | "medical_emergency";

interface HazardOption {
  value: HazardType;
  label: string;
  description: string;
  icon: React.ElementType;
  category: "natural" | "technological" | "human";
}

const HAZARD_OPTIONS: HazardOption[] = [
  {
    value: "fire",
    label: "Fire",
    description: "Building fires, equipment fires",
    icon: Flame,
    category: "natural",
  },
  {
    value: "flood",
    label: "Flood",
    description: "Flooding, water damage",
    icon: Droplets,
    category: "natural",
  },
  {
    value: "earthquake",
    label: "Earthquake",
    description: "Seismic activity",
    icon: Activity,
    category: "natural",
  },
  {
    value: "tornado",
    label: "Tornado",
    description: "Severe windstorms",
    icon: Wind,
    category: "natural",
  },
  {
    value: "hurricane",
    label: "Hurricane",
    description: "Tropical storms, cyclones",
    icon: Cloud,
    category: "natural",
  },
  {
    value: "power_outage",
    label: "Power Outage",
    description: "Electrical failures",
    icon: Power,
    category: "technological",
  },
  {
    value: "cyberattack",
    label: "Cyber Attack",
    description: "Data breaches, ransomware",
    icon: Wifi,
    category: "technological",
  },
  {
    value: "chemical",
    label: "Chemical",
    description: "Chemical spills, exposure",
    icon: Skull,
    category: "technological",
  },
  {
    value: "biological",
    label: "Biological",
    description: "Infectious diseases",
    icon: AlertTriangle,
    category: "technological",
  },
  {
    value: "radiological",
    label: "Radiological",
    description: "Radiation exposure",
    icon: Radiation,
    category: "technological",
  },
  {
    value: "explosion",
    label: "Explosion",
    description: "Blast events",
    icon: Bomb,
    category: "technological",
  },
  {
    value: "hazmat",
    label: "Hazmat",
    description: "Hazardous materials",
    icon: Zap,
    category: "technological",
  },
  {
    value: "active_shooter",
    label: "Active Shooter",
    description: "Armed intruder, violence",
    icon: Target,
    category: "human",
  },
  {
    value: "medical_emergency",
    label: "Medical Emergency",
    description: "Health emergencies",
    icon: Heart,
    category: "human",
  },
];

interface HazardChecklistProps {
  selectedHazards: HazardType[];
  onChange: (hazards: HazardType[]) => void;
  customHazards?: string[];
  onCustomHazardsChange?: (hazards: string[]) => void;
  locationRisks?: {
    floodZone?: boolean;
    earthquakeZone?: boolean;
    tornadoAlley?: boolean;
    hurricaneCoast?: boolean;
    wildfire?: boolean;
  };
  state?: string; // For location-based suggestions
}

export function HazardChecklist({
  selectedHazards,
  onChange,
  customHazards = [],
  onCustomHazardsChange,
  locationRisks,
  state,
}: HazardChecklistProps) {
  const [newCustomHazard, setNewCustomHazard] = useState("");

  const handleToggle = (hazard: HazardType) => {
    if (selectedHazards.includes(hazard)) {
      onChange(selectedHazards.filter((h) => h !== hazard));
    } else {
      onChange([...selectedHazards, hazard]);
    }
  };

  const handleSelectAll = (category: "natural" | "technological" | "human") => {
    const categoryHazards = HAZARD_OPTIONS.filter(
      (opt) => opt.category === category
    ).map((opt) => opt.value);

    const allSelected = categoryHazards.every((h) =>
      selectedHazards.includes(h)
    );

    if (allSelected) {
      // Deselect all in category
      onChange(selectedHazards.filter((h) => !categoryHazards.includes(h)));
    } else {
      // Select all in category
      const newSelection = [
        ...selectedHazards,
        ...categoryHazards.filter((h) => !selectedHazards.includes(h)),
      ];
      onChange(newSelection);
    }
  };

  const handleAddCustomHazard = () => {
    if (newCustomHazard.trim() && !customHazards.includes(newCustomHazard.trim())) {
      onCustomHazardsChange?.([...customHazards, newCustomHazard.trim()]);
      setNewCustomHazard("");
    }
  };

  const handleRemoveCustomHazard = (hazard: string) => {
    onCustomHazardsChange?.(customHazards.filter((h) => h !== hazard));
  };

  const getLocationSuggestions = (): HazardType[] => {
    const suggestions: HazardType[] = [];

    // State-based suggestions
    const floodStates = ["TX", "LA", "FL", "MS", "AL"];
    const earthquakeStates = ["CA", "OR", "WA", "AK", "NV"];
    const tornadoStates = ["OK", "KS", "NE", "TX", "MO", "AR"];
    const hurricaneStates = ["FL", "LA", "TX", "NC", "SC", "GA"];

    if (state) {
      if (floodStates.includes(state) || locationRisks?.floodZone) {
        suggestions.push("flood");
      }
      if (earthquakeStates.includes(state) || locationRisks?.earthquakeZone) {
        suggestions.push("earthquake");
      }
      if (tornadoStates.includes(state) || locationRisks?.tornadoAlley) {
        suggestions.push("tornado");
      }
      if (hurricaneStates.includes(state) || locationRisks?.hurricaneCoast) {
        suggestions.push("hurricane");
      }
    }

    // Universal hazards
    suggestions.push("fire", "power_outage", "medical_emergency");

    return suggestions.filter((h) => !selectedHazards.includes(h));
  };

  const suggestions = getLocationSuggestions();

  const categories: Array<{ key: "natural" | "technological" | "human"; label: string }> = [
    { key: "natural", label: "Natural Disasters" },
    { key: "technological", label: "Technological Hazards" },
    { key: "human", label: "Human-Caused Events" },
  ];

  return (
    <div className="space-y-6">
      {/* Location-based suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Suggested for your location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((hazard) => {
                const option = HAZARD_OPTIONS.find((opt) => opt.value === hazard);
                if (!option) return null;

                return (
                  <Badge
                    key={hazard}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleToggle(hazard)}
                  >
                    {option.label}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hazard categories */}
      {categories.map(({ key, label }) => {
        const categoryOptions = HAZARD_OPTIONS.filter(
          (opt) => opt.category === key
        );
        const allSelected = categoryOptions.every((opt) =>
          selectedHazards.includes(opt.value)
        );

        return (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{label}</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAll(key)}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedHazards.includes(option.value);

                return (
                  <Card
                    key={option.value}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-sm",
                      isSelected && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleToggle(option.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-4 w-4 rounded border-2 flex-shrink-0 mt-0.5 transition-colors",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}>
                          {isSelected && (
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
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <Label className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom hazards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Custom Hazards</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Add a custom hazard..."
            value={newCustomHazard}
            onChange={(e) => setNewCustomHazard(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomHazard();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddCustomHazard}
            disabled={!newCustomHazard.trim()}
          >
            Add
          </Button>
        </div>

        {customHazards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customHazards.map((hazard) => (
              <Badge
                key={hazard}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleRemoveCustomHazard(hazard)}
              >
                {hazard}
                <span className="ml-1 text-xs">×</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Selection summary */}
      <div className="text-sm text-muted-foreground">
        {selectedHazards.length + customHazards.length} hazard(s) selected
      </div>
    </div>
  );
}

/**
 * Get hazard label
 */
export function getHazardLabel(hazard: HazardType): string {
  return HAZARD_OPTIONS.find((opt) => opt.value === hazard)?.label || hazard;
}

"use client";

/**
 * Emergency Navigation Button - Floating Action Button
 * Separate component to bypass caching issues
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShieldCheck, FileText, Phone, AlertCircle, Users, MapPin, Radio, Package, GraduationCap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmergencyNavButtonProps {
  sections: Array<{
    id: string;
    title: string;
  }>;
  activeSection: string | null;
  onNavigate: (sectionId: string) => void;
  className?: string;
}

// Map section titles to icons
const getSectionIcon = (title: string) => {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("contact")) return Phone;
  if (titleLower.includes("emergency") || titleLower.includes("scenario")) return AlertCircle;
  if (titleLower.includes("evacuation") || titleLower.includes("route")) return MapPin;
  if (titleLower.includes("command") || titleLower.includes("responsibilities") || titleLower.includes("team")) return Users;
  if (titleLower.includes("communication") || titleLower.includes("protocol")) return Radio;
  if (titleLower.includes("resource") || titleLower.includes("equipment")) return Package;
  if (titleLower.includes("training") || titleLower.includes("drill")) return GraduationCap;
  if (titleLower.includes("maintenance") || titleLower.includes("update")) return RefreshCw;
  if (titleLower.includes("summary") || titleLower.includes("purpose") || titleLower.includes("scope")) return FileText;

  return FileText;
};

export function EmergencyNavButton({ sections, activeSection, onNavigate, className }: EmergencyNavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (sectionId: string) => {
    setIsOpen(false);
    setTimeout(() => {
      onNavigate(sectionId);
    }, 350);
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 lg:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 border-4 border-white"
            aria-label="Open emergency plan navigation"
          >
            <ShieldCheck className="h-8 w-8 text-white drop-shadow-md" strokeWidth={3} />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Emergency Plan Sections</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {sections.map((section) => {
              const Icon = getSectionIcon(section.title);
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleNavigation(section.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">{section.title}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation("section-emergency-contact")}
              >
                <Phone className="mr-2 h-4 w-4" />
                Emergency Contacts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleNavigation("section-evacuation")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Evacuation Routes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

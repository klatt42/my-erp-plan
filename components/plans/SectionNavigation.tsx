"use client";

/**
 * Mobile-Optimized Section Navigation
 * Provides quick access to plan sections for field/mobile use
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, FileText, Phone, AlertCircle, Users, MapPin, Radio, Package, GraduationCap, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ERPSection {
  title: string;
  content: string;
  subsections?: Array<{
    title: string;
    content: string;
  }>;
}

interface SectionNavigationProps {
  sections: ERPSection[];
  executiveSummary?: string;
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

export function SectionNavigation({ sections, executiveSummary, className }: SectionNavigationProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; // Offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(sectionId);
      setIsOpen(false);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      // Check executive summary
      if (executiveSummary) {
        const execElement = document.getElementById("section-executive-summary");
        if (execElement) {
          const rect = execElement.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection("section-executive-summary");
            return;
          }
        }
      }

      // Check sections
      for (let i = 0; i < sections.length; i++) {
        const element = document.getElementById(`section-${i}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(`section-${i}`);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, executiveSummary]);

  const allSections = [
    ...(executiveSummary ? [{ id: "section-executive-summary", title: "Executive Summary" }] : []),
    ...sections.map((section, index) => ({
      id: `section-${index}`,
      title: section.title,
    })),
  ];

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 lg:hidden", className)}>
      {/* Mobile: Floating Action Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Emergency Plan Sections</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {allSections.map((section) => {
              const Icon = getSectionIcon(section.title);
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
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
                onClick={() => {
                  scrollToSection("section-emergency-contact");
                  setIsOpen(false);
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Emergency Contacts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  scrollToSection("section-evacuation");
                  setIsOpen(false);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Evacuation Routes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Sidebar (hidden on mobile) */}
      <div className="hidden lg:block fixed right-4 top-24 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto bg-card border rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Plan Sections</h3>
        <div className="space-y-1">
          {allSections.map((section) => {
            const Icon = getSectionIcon(section.title);
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full flex items-start gap-2 p-2 rounded text-left transition-colors text-sm",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="leading-tight">{section.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

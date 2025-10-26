"use client";

/**
 * Mobile-Optimized Section Navigation
 * Provides quick access to plan sections for field/mobile use
 */

import { useState, useEffect } from "react";
import { FileText, Phone, AlertCircle, Users, MapPin, Radio, Package, GraduationCap, RefreshCw, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmergencyNavButton } from "./EmergencyNavButton";
import { Button } from "@/components/ui/button";

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
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);

    if (!element) {
      return;
    }

    // Close the sheet first
    setIsOpen(false);

    // Auto-minimize desktop sidebar after navigation
    setIsDesktopSidebarOpen(false);

    // Wait for sheet to close before scrolling (300ms animation)
    setTimeout(() => {
      // Find the scrollable container (main element with overflow-y-auto)
      const scrollContainer = document.querySelector('main');

      if (scrollContainer) {
        // Scroll within the container
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        const offset = elementTop - containerTop - 20; // 20px padding from top

        scrollContainer.scrollTo({
          top: scrollContainer.scrollTop + offset,
          behavior: "smooth"
        });
      } else {
        // Fallback to window scroll if container not found
        const yOffset = -100;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }

      setActiveSection(sectionId);
    }, 350);
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
    <>
      {/* Mobile: Floating Emergency Navigation Button */}
      <EmergencyNavButton
        sections={allSections}
        activeSection={activeSection}
        onNavigate={scrollToSection}
        className={className}
      />

      {/* Desktop: Collapsible Sidebar (hidden on mobile) */}
      <div className="hidden lg:block fixed right-4 top-24 z-40">
        {isDesktopSidebarOpen ? (
          <div className="w-64 max-h-[calc(100vh-8rem)] overflow-y-auto bg-card border rounded-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-semibold">Plan Sections</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsDesktopSidebarOpen(false)}
                aria-label="Minimize sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 p-4 pt-2">
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
        ) : (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setIsDesktopSidebarOpen(true)}
            aria-label="Open plan navigation"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  );
}

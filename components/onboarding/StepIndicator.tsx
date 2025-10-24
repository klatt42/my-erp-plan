/**
 * Step Indicator Component
 * Shows progress through the multi-step onboarding questionnaire
 */

"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isUpcoming = step.number > currentStep;

          return (
            <li key={step.number} className="md:flex-1">
              <div
                className={cn(
                  "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                  isCompleted && "border-primary",
                  isCurrent && "border-primary",
                  isUpcoming && "border-gray-200"
                )}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                      isCompleted &&
                        "bg-primary text-primary-foreground group-hover:bg-primary/90",
                      isCurrent &&
                        "border-2 border-primary bg-background text-primary",
                      isUpcoming && "border-2 border-gray-300 bg-background text-gray-500"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-sm font-semibold">{step.number}</span>
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isCompleted && "text-primary",
                        isCurrent && "text-primary",
                        isUpcoming && "text-gray-500"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </span>
                  </div>
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile progress bar */}
      <div className="mt-4 md:hidden">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((completedSteps.length / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}

/**
 * Default steps for onboarding
 */
export const ONBOARDING_STEPS: Step[] = [
  {
    number: 1,
    title: "Organization",
    description: "Basic information",
  },
  {
    number: 2,
    title: "Facility",
    description: "Building details",
  },
  {
    number: 3,
    title: "Assets",
    description: "Collections & inventory",
  },
  {
    number: 4,
    title: "Hazards",
    description: "Risk assessment",
  },
  {
    number: 5,
    title: "Team",
    description: "Staff & roles",
  },
  {
    number: 6,
    title: "Compliance",
    description: "Requirements",
  },
];

/**
 * Multi-step Onboarding Questionnaire
 * Collects facility information and generates AI-powered Emergency Response Plan
 */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { StepIndicator, ONBOARDING_STEPS } from "@/components/onboarding/StepIndicator";
import {
  Step1Content,
  Step2Content,
  Step3Content,
  Step4Content,
  Step5Content,
  Step6Content,
} from "@/components/onboarding/StepForms";

import {
  getStepSchema,
  getStepDefaults,
  onboardingToFacilityProfile,
  type CompleteOnboarding,
} from "@/lib/validations/onboarding";

const STORAGE_KEY = "onboarding_progress";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [allStepData, setAllStepData] = useState<Partial<CompleteOnboarding>>({});

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAllStepData(data.allStepData || {});
        setCurrentStep(data.currentStep || 1);
        setCompletedSteps(data.completedSteps || []);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.keys(allStepData).length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          allStepData,
          currentStep,
          completedSteps,
          savedAt: new Date().toISOString(),
        })
      );
    }
  }, [allStepData, currentStep, completedSteps]);

  const form = useForm({
    resolver: zodResolver(getStepSchema(currentStep)),
    defaultValues: getStepDefaults(currentStep),
  });

  // Load data for current step
  useEffect(() => {
    const stepKey = `step${currentStep}` as keyof CompleteOnboarding;
    const savedData = allStepData[stepKey];

    if (savedData) {
      form.reset(savedData);
    } else {
      form.reset(getStepDefaults(currentStep));
    }
  }, [currentStep, form, allStepData]);

  const handleNext = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    // Save current step data
    const stepKey = `step${currentStep}` as keyof CompleteOnboarding;
    const stepData = form.getValues();

    setAllStepData((prev) => ({
      ...prev,
      [stepKey]: stepData,
    }));

    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    // Move to next step
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    // Save final step data
    const stepKey = `step${currentStep}` as keyof CompleteOnboarding;
    const stepData = form.getValues();

    const finalData = {
      ...allStepData,
      [stepKey]: stepData,
    } as CompleteOnboarding;

    setIsGenerating(true);

    try {
      // Convert to FacilityProfile format
      const facilityProfile = onboardingToFacilityProfile(finalData);

      // Call API to generate ERP
      const response = await fetch("/api/plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityProfile }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate plan");
      }

      const { plan } = await response.json();

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Success!",
        description: "Your Emergency Response Plan has been generated",
      });

      // Redirect to the generated plan
      router.push(`/${plan.org_id}/plans/${plan.id}`);
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate Emergency Response Plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearProgress = () => {
    if (confirm("Are you sure you want to clear your progress and start over?")) {
      localStorage.removeItem(STORAGE_KEY);
      setAllStepData({});
      setCurrentStep(1);
      setCompletedSteps([]);
      form.reset(getStepDefaults(1));
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Emergency Response Plan Setup</h1>
        <p className="text-muted-foreground mt-2">
          Answer a few questions about your facility, and we'll generate a comprehensive,
          compliant emergency response plan using AI.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{ONBOARDING_STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {ONBOARDING_STEPS[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Step 1: Organization Info */}
            {currentStep === 1 && <Step1Content form={form} />}

            {/* Step 2: Facility Details */}
            {currentStep === 2 && <Step2Content form={form} />}

            {/* Step 3: Collections/Assets */}
            {currentStep === 3 && <Step3Content form={form} allStepData={allStepData} />}

            {/* Step 4: Hazard Assessment */}
            {currentStep === 4 && <Step4Content form={form} allStepData={allStepData} />}

            {/* Step 5: Team Structure */}
            {currentStep === 5 && <Step5Content form={form} />}

            {/* Step 6: Compliance Needs */}
            {currentStep === 6 && <Step6Content form={form} />}
          </form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isGenerating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {completedSteps.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearProgress}
              disabled={isGenerating}
            >
              Clear Progress
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < 6 ? (
            <Button type="button" onClick={handleNext} disabled={isGenerating}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isGenerating}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Emergency Plan
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <Card className="mt-6 border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="font-medium">Generating your Emergency Response Plan...</p>
              <p className="text-sm text-muted-foreground">
                This may take 15-30 seconds. We're analyzing your facility data and
                generating a comprehensive, compliant plan using AI.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Continue in next message with step components...

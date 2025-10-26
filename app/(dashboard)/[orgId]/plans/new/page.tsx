"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

export default function NewPlanPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Emergency Plan</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to create your emergency response plan
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guided Questionnaire - Recommended */}
        <Card className="relative border-primary shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute -top-3 left-4">
            <Badge className="bg-primary text-primary-foreground">
              Recommended
            </Badge>
          </div>
          <CardHeader className="pt-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Guided Questionnaire</CardTitle>
            </div>
            <CardDescription>
              Step-by-step questionnaire that collects detailed information about your facility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">6-step comprehensive assessment</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">Facility-specific hazard selection</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">Compliance framework integration</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">More accurate and detailed plans</p>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push(`/onboarding-new?orgId=${orgId}`)}
            >
              Start Questionnaire
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Takes about 10-15 minutes
            </p>
          </CardContent>
        </Card>

        {/* Quick Plan - Manual */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-muted">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Quick Plan</CardTitle>
            </div>
            <CardDescription>
              Describe your needs in text and let AI generate a plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Simple text description</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">AI-generated content</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Fast and flexible</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Less structured output</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => router.push(`/${orgId}/plans/quick`)}
            >
              Create Quick Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Takes about 2-3 minutes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generatePlanContent } from "@/lib/anthropic/client";
import { createPlanSchema, type CreatePlanInput } from "@/lib/validations/plan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function NewPlanPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<CreatePlanInput>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      version: "1.0",
      prompt: "",
    },
  });

  async function onSubmit(data: CreatePlanInput) {
    setIsGenerating(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to create a plan");
        return;
      }

      // Generate plan content with Claude
      const generatedContent = await generatePlanContent(data.prompt);

      // Create the plan
      const { data: plan, error: createError } = await supabase
        .from("emergency_plans")
        .insert({
          org_id: orgId,
          version: data.version,
          status: "draft",
          content_json: { generated_content: generatedContent },
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        setError(createError.message);
        return;
      }

      router.push(`/${orgId}/plans/${plan.id}`);
      router.refresh();
    } catch (err) {
      setError("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Emergency Plan</h1>
        <p className="text-muted-foreground">
          Use AI to generate a comprehensive emergency response plan
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} disabled={isGenerating} />
                    </FormControl>
                    <FormDescription>
                      Version number for this plan
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Description</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe the type of emergency plan you need. For example: 'Create a fire evacuation plan for a 5-story office building with 200 employees'"
                        {...field}
                        disabled={isGenerating}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about your organization and the type of plan
                      you need
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating plan..." : "Generate plan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

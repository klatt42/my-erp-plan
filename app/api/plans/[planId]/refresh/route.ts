/**
 * POST /api/plans/[planId]/refresh - Refresh an existing plan with latest data
 *
 * This endpoint:
 * 1. Retrieves the existing plan and its facility profile
 * 2. Fetches the latest facility research data
 * 3. Regenerates the plan with updated information
 * 4. Updates the existing plan (if draft) or creates a new version
 */

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { generateERP } from "@/lib/anthropic/client";
import { getFacilityResearch } from "@/app/actions/research-facility";
import type { FacilityProfile } from "@/lib/anthropic/types";

export async function POST(
  request: Request,
  { params }: { params: { planId: string } }
) {
  const { planId } = params;
  console.log(`[/api/plans/${planId}/refresh] POST request received`);

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error(`[/api/plans/${planId}/refresh] Unauthorized - no user`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[/api/plans/${planId}/refresh] User authenticated: ${user.id}`);

    // Get the existing plan
    const { data: existingPlan, error: planError } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !existingPlan) {
      console.error(`[/api/plans/${planId}/refresh] Plan not found`);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .eq("org_id", existingPlan.org_id)
      .single();

    if (!membership) {
      console.error(`[/api/plans/${planId}/refresh] User does not have access to this organization`);
      return NextResponse.json(
        { error: "You do not have access to this organization" },
        { status: 403 }
      );
    }

    // Extract the original facility profile from the plan
    const facilityProfile: FacilityProfile = existingPlan.content_json?.facilityProfile;

    if (!facilityProfile) {
      console.error(`[/api/plans/${planId}/refresh] No facility profile found in existing plan`);
      return NextResponse.json(
        { error: "Cannot refresh plan - no facility profile data found. This plan may have been created before the refresh feature was added." },
        { status: 400 }
      );
    }

    console.log(`[/api/plans/${planId}/refresh] Refreshing plan for: ${facilityProfile.name}`);

    // STEP 1: Preserve manually edited emergency contacts from existing plan
    // Extract emergency contacts from the existing plan content
    const existingEmergencyContactsSection = existingPlan.content_json?.sections?.find(
      (section: any) => section.title?.toLowerCase().includes("emergency contact")
    );

    let preservedEmergencyCoordinator: any = null;
    let preservedFacilityManager: any = null;
    let preservedAlternateContact: any = null;

    if (existingEmergencyContactsSection?.content) {
      console.log(`[/api/plans/${planId}/refresh] Extracting manually edited contacts from existing plan`);

      // Parse the markdown table to extract emergency coordinator
      const facilityContactsMatch = existingEmergencyContactsSection.content.match(
        /\*\*Facility Emergency Contacts\*\*[\s\S]*?\n\|.*?\n\|.*?\n((?:\|.*?\n)+)/
      );

      if (facilityContactsMatch) {
        const tableRows = facilityContactsMatch[1].trim().split('\n');

        for (const row of tableRows) {
          const cells = row.split('|').map((c: string) => c.trim()).filter((c: string) => c);

          if (cells.length >= 2) {
            const role = cells[0]?.toLowerCase() || '';
            const primaryContact = cells[1] || '';

            // Extract Emergency Coordinator
            if (role.includes('emergency coordinator') && primaryContact && !primaryContact.includes('To be assigned')) {
              // Parse: "Name, Title (Phone) email"
              const nameMatch = primaryContact.match(/^([^,]+),?\s*([^(]+)?\s*\(?([0-9\s\-()]+)?\)?\s*(\S+@\S+)?/);
              if (nameMatch) {
                preservedEmergencyCoordinator = {
                  name: nameMatch[1]?.trim(),
                  title: nameMatch[2]?.trim() || '',
                  phone: nameMatch[3]?.trim() || '',
                  email: nameMatch[4]?.trim() || '',
                };
                console.log(`[/api/plans/${planId}/refresh] Preserved Emergency Coordinator: ${preservedEmergencyCoordinator.name}`);
              }
            }

            // Extract Facility Manager
            if (role.includes('facility manager') && primaryContact && !primaryContact.includes('To be assigned')) {
              const nameMatch = primaryContact.match(/^([^(]+)\s*\(?([0-9\s\-()]+)?\)?/);
              if (nameMatch) {
                preservedFacilityManager = {
                  name: nameMatch[1]?.trim(),
                  phone: nameMatch[2]?.trim() || '',
                };
                console.log(`[/api/plans/${planId}/refresh] Preserved Facility Manager: ${preservedFacilityManager.name}`);
              }
            }
          }
        }
      }
    }

    // STEP 2: Fetch organization data for onboarding contacts (these take precedence if they exist)
    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", existingPlan.org_id)
      .single();

    // Initialize emergency contacts object
    const profile = facilityProfile as any;
    if (!profile.emergencyContacts) {
      profile.emergencyContacts = {};
    }

    // STEP 3: Merge contacts - Priority: Onboarding > Preserved Edits
    if (org?.onboarding_data) {
      console.log(`[/api/plans/${planId}/refresh] Merging emergency contacts from organization onboarding`);

      const onboardingData = org.onboarding_data as any;

      // Update with latest internal contacts from Step 5
      if (onboardingData.step5) {
        if (onboardingData.step5.emergencyCoordinator) {
          profile.emergencyContacts.emergencyCoordinator = onboardingData.step5.emergencyCoordinator;
          console.log(`[/api/plans/${planId}/refresh] Using Emergency Coordinator from onboarding: ${onboardingData.step5.emergencyCoordinator.name}`);
        }
        if (onboardingData.step5.alternateContact) {
          profile.emergencyContacts.alternateContact = onboardingData.step5.alternateContact;
        }
        if (onboardingData.step5.facilityManager) {
          profile.emergencyContacts.facilityManager = onboardingData.step5.facilityManager;
        }
      }

      // Update with latest support services from Step 6
      if (onboardingData.step6) {
        if (onboardingData.step6.mitigationContractor) {
          profile.emergencyContacts.mitigationContractor = onboardingData.step6.mitigationContractor;
        }
        if (onboardingData.step6.mitigationContractorPhone) {
          profile.emergencyContacts.mitigationContractorPhone = onboardingData.step6.mitigationContractorPhone;
        }
        if (onboardingData.step6.mitigationContractorContact) {
          profile.emergencyContacts.mitigationContractorContact = onboardingData.step6.mitigationContractorContact;
        }
        if (onboardingData.step6.specialtyContentsContractor) {
          profile.emergencyContacts.specialtyContentsContractor = onboardingData.step6.specialtyContentsContractor;
        }
        if (onboardingData.step6.specialtyContentsContractorPhone) {
          profile.emergencyContacts.specialtyContentsContractorPhone = onboardingData.step6.specialtyContentsContractorPhone;
        }
        if (onboardingData.step6.specialtyContentsContractorContact) {
          profile.emergencyContacts.specialtyContentsContractorContact = onboardingData.step6.specialtyContentsContractorContact;
        }
      }
    }

    // STEP 4: Use preserved manual edits if onboarding data doesn't exist
    if (!profile.emergencyContacts.emergencyCoordinator && preservedEmergencyCoordinator) {
      profile.emergencyContacts.emergencyCoordinator = preservedEmergencyCoordinator;
      console.log(`[/api/plans/${planId}/refresh] Using preserved Emergency Coordinator from manual edits`);
    }

    if (!profile.emergencyContacts.facilityManager && preservedFacilityManager) {
      profile.emergencyContacts.facilityManager = preservedFacilityManager;
      console.log(`[/api/plans/${planId}/refresh] Using preserved Facility Manager from manual edits`);
    }

    // Fetch latest facility research data
    const facilityResearch = await getFacilityResearch(existingPlan.org_id);
    if (facilityResearch) {
      console.log(`[/api/plans/${planId}/refresh] Including latest facility research data from ${facilityResearch.researched_at}`);
      profile.facilityResearch = facilityResearch;
    } else {
      console.log(`[/api/plans/${planId}/refresh] No facility research data available`);
    }

    // Generate refreshed ERP using Claude
    console.log(`[/api/plans/${planId}/refresh] Calling generateERP()...`);
    const startTime = Date.now();

    const result = await generateERP(facilityProfile, {
      includeTemplates: true,
      includeChecklists: true,
    });

    const duration = Date.now() - startTime;
    console.log(`[/api/plans/${planId}/refresh] ERP generation completed in ${duration}ms`);

    if (!result.success) {
      console.error(`[/api/plans/${planId}/refresh] ERP generation failed:`, result.error);
      return NextResponse.json(
        {
          error: result.error?.message || "Failed to regenerate emergency plan",
          code: result.error?.code,
          retryable: result.error?.retryable,
        },
        { status: 500 }
      );
    }

    const generatedERP = result.data!;
    console.log(`[/api/plans/${planId}/refresh] ERP generated successfully. Tokens used: ${generatedERP.tokensUsed?.total || 'unknown'}`);

    // Use service role to bypass RLS
    const serviceSupabase = createServerClient();

    // Determine whether to update existing plan or create new version
    const shouldUpdate = existingPlan.status === "draft";

    if (shouldUpdate) {
      // Update existing draft plan
      console.log(`[/api/plans/${planId}/refresh] Updating existing draft plan`);

      const { data: updatedPlan, error: updateError } = (await serviceSupabase
        .from("emergency_plans")
        .update({
          content_json: {
            generatedAt: generatedERP.generatedAt,
            facilityName: generatedERP.facilityName,
            facilityType: generatedERP.facilityType,
            executiveSummary: generatedERP.executiveSummary,
            sections: generatedERP.sections,
            tokensUsed: generatedERP.tokensUsed,
            facilityProfile: facilityProfile,
            refreshedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", planId)
        .select()
        .single()) as any;

      if (updateError) {
        console.error(`[/api/plans/${planId}/refresh] Database update error:`, updateError);
        return NextResponse.json(
          { error: "Failed to update plan", details: updateError.message },
          { status: 500 }
        );
      }

      console.log(`[/api/plans/${planId}/refresh] Plan updated successfully`);

      return NextResponse.json(
        {
          success: true,
          action: "updated",
          plan: {
            id: updatedPlan.id,
            org_id: updatedPlan.org_id,
            version: updatedPlan.version,
            status: updatedPlan.status,
            updated_at: updatedPlan.updated_at,
          },
          tokensUsed: generatedERP.tokensUsed,
          message: "Emergency Response Plan refreshed successfully",
        },
        { status: 200 }
      );
    } else {
      // Create new version for non-draft plans
      console.log(`[/api/plans/${planId}/refresh] Creating new version (current status: ${existingPlan.status})`);

      // Parse version number and increment
      const currentVersion = existingPlan.version || "1.0.0";
      const versionParts = currentVersion.split(".");
      const newMinorVersion = parseInt(versionParts[1] || "0") + 1;
      const newVersion = `${versionParts[0]}.${newMinorVersion}.0`;

      const { data: newPlan, error: createError } = (await serviceSupabase
        .from("emergency_plans")
        .insert({
          org_id: existingPlan.org_id,
          version: newVersion,
          status: "draft",
          content_json: {
            generatedAt: generatedERP.generatedAt,
            facilityName: generatedERP.facilityName,
            facilityType: generatedERP.facilityType,
            executiveSummary: generatedERP.executiveSummary,
            sections: generatedERP.sections,
            tokensUsed: generatedERP.tokensUsed,
            facilityProfile: facilityProfile,
            refreshedFrom: planId,
            refreshedAt: new Date().toISOString(),
          },
          created_by: user.id,
        } as any)
        .select()
        .single()) as any;

      if (createError) {
        console.error(`[/api/plans/${planId}/refresh] Database insert error:`, createError);
        return NextResponse.json(
          { error: "Failed to create new plan version", details: createError.message },
          { status: 500 }
        );
      }

      console.log(`[/api/plans/${planId}/refresh] New version ${newVersion} created: ${newPlan.id}`);

      return NextResponse.json(
        {
          success: true,
          action: "new_version",
          plan: {
            id: newPlan.id,
            org_id: newPlan.org_id,
            version: newPlan.version,
            status: newPlan.status,
            created_at: newPlan.created_at,
          },
          tokensUsed: generatedERP.tokensUsed,
          message: `New version ${newVersion} created successfully`,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error(`[/api/plans/${planId}/refresh] Unexpected error:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

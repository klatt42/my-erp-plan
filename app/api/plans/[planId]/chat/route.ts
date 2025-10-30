/**
 * POST /api/plans/[planId]/chat
 *
 * AI-powered natural language editing for emergency plans
 * Users can ask to remove contacts, modify text, add sections, etc.
 */

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(
  request: Request,
  { params }: { params: { planId: string } }
) {
  const { planId } = params;
  console.log(`[/api/plans/${planId}/chat] POST request received`);

  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the plan
    const { data: plan, error: planError } = await supabase
      .from("emergency_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Verify user has edit access
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", plan.org_id)
      .eq("user_id", user.id)
      .single();

    if (!membership || (membership.role !== "admin" && membership.role !== "editor")) {
      return NextResponse.json({ error: "Forbidden - edit access required" }, { status: 403 });
    }

    // Parse request
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log(`[/api/plans/${planId}/chat] User message: ${message}`);

    // Get current plan content
    const planContent = plan.content_json as any;
    const currentSections = planContent?.sections || [];

    // Build context for Claude
    const planContext = JSON.stringify({
      facilityName: planContent?.facilityName || "Unknown Facility",
      facilityType: planContent?.facilityType || "Unknown",
      sections: currentSections.map((s: any) => ({
        title: s.title,
        content: s.content?.substring(0, 1000), // Truncate for context
      })),
    }, null, 2);

    // Ask Claude to understand the edit request and generate modifications
    const prompt = `You are an AI assistant helping to edit an Emergency Response Plan. The user wants to make changes to their plan using natural language.

Current Emergency Response Plan:
${planContext}

User's edit request: "${message}"

Please analyze the request and provide:
1. A description of what changes you'll make
2. The specific modifications needed in JSON format

Respond with JSON in this exact format:
{
  "understood": "Brief confirmation of what you understood",
  "changes": [
    {
      "action": "remove_contact|modify_text|add_section|remove_section|update_section",
      "sectionTitle": "Section name to modify",
      "details": {
        "searchFor": "Text or name to find/remove",
        "replaceWith": "New text (for modify_text)",
        "newContent": "New section content (for add/update_section)"
      }
    }
  ],
  "preview": "Brief description of the result"
}

Important:
- For "remove contact" requests, use action: "modify_text" to remove the contact's row from the table
- For text changes, find the CLOSEST matching text in the plan even if it's not exact
- Look at the context and section to understand what the user wants to change
- If the user says "Edit the selected text: 'X' - change to Y", find X (or something very similar) and replace it with Y
- Be flexible with matching - if you can't find the exact text, look for similar text in the same section
- If request is unclear, suggest what you think they mean`;

    const message1 = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message1.content[0].type === "text" ? message1.content[0].text : "";
    console.log(`[/api/plans/${planId}/chat] Claude response:`, responseText.substring(0, 200));

    // Parse Claude's response
    let aiResponse;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      aiResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error(`[/api/plans/${planId}/chat] Failed to parse AI response:`, parseError);
      return NextResponse.json({
        reply: "I understood your request, but I need more information to make this change. Could you please be more specific?",
        applied: false,
      });
    }

    console.log(`[/api/plans/${planId}/chat] Parsed changes:`, JSON.stringify(aiResponse, null, 2));

    // Apply the changes
    let updatedSections = [...currentSections];
    const appliedChanges: string[] = [];

    for (const change of aiResponse.changes || []) {
      const { action, sectionTitle, details } = change;
      console.log(`[/api/plans/${planId}/chat] Processing change - Action: ${action}, Section: ${sectionTitle}, Details:`, details);

      // Find the section
      const sectionIndex = updatedSections.findIndex((s: any) =>
        s.title?.toLowerCase().includes(sectionTitle?.toLowerCase())
      );

      if (sectionIndex === -1 && action !== "add_section") {
        console.log(`[/api/plans/${planId}/chat] Section not found: ${sectionTitle}`);
        continue;
      }

      switch (action) {
        case "remove_contact":
        case "modify_text": {
          if (sectionIndex !== -1) {
            const section = updatedSections[sectionIndex];
            let content = section.content || "";

            if (details.searchFor) {
              // For removing contacts, remove the entire table row
              if (action === "remove_contact") {
                // Remove the row containing this contact
                const lines = content.split('\n');
                const filteredLines = lines.filter(line =>
                  !line.toLowerCase().includes(details.searchFor.toLowerCase())
                );
                content = filteredLines.join('\n');
              } else {
                // Simple text replacement - escape regex special characters
                const escapedSearch = details.searchFor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedSearch, 'gi');

                // Try exact match first
                if (regex.test(content)) {
                  content = content.replace(regex, details.replaceWith || '');
                } else {
                  // If exact match fails, try case-insensitive partial match
                  console.log(`[/api/plans/${planId}/chat] Exact match failed, trying fuzzy match for: ${details.searchFor}`);
                  const searchLower = details.searchFor.toLowerCase();
                  const lines = content.split('\n');
                  let found = false;

                  for (let i = 0; i < lines.length; i++) {
                    if (lines[i].toLowerCase().includes(searchLower)) {
                      // Found a line containing the search text
                      lines[i] = lines[i].replace(new RegExp(details.searchFor, 'gi'), details.replaceWith || '');
                      found = true;
                      console.log(`[/api/plans/${planId}/chat] Fuzzy match found in line ${i}: ${lines[i]}`);
                    }
                  }

                  if (found) {
                    content = lines.join('\n');
                  } else {
                    console.log(`[/api/plans/${planId}/chat] No match found for: ${details.searchFor}`);
                  }
                }
              }

              console.log(`[/api/plans/${planId}/chat] Content length before: ${section.content?.length}, after: ${content.length}`);
              console.log(`[/api/plans/${planId}/chat] Updated content preview:`, content.substring(0, 300));

              updatedSections[sectionIndex] = {
                ...section,
                content,
              };

              appliedChanges.push(`Modified "${sectionTitle}"`);
            }
          }
          break;
        }

        case "add_section": {
          updatedSections.push({
            title: sectionTitle,
            content: details.newContent || "",
            metadata: {
              addedViaChat: true,
              addedAt: new Date().toISOString(),
            },
          });
          appliedChanges.push(`Added new section "${sectionTitle}"`);
          break;
        }

        case "remove_section": {
          if (sectionIndex !== -1) {
            updatedSections.splice(sectionIndex, 1);
            appliedChanges.push(`Removed section "${sectionTitle}"`);
          }
          break;
        }

        case "update_section": {
          if (sectionIndex !== -1) {
            updatedSections[sectionIndex] = {
              ...updatedSections[sectionIndex],
              content: details.newContent || updatedSections[sectionIndex].content,
            };
            appliedChanges.push(`Updated section "${sectionTitle}"`);
          }
          break;
        }
      }
    }

    // Save the updated plan
    const serviceSupabase = createServerClient();

    const { error: updateError } = await serviceSupabase
      .from("emergency_plans")
      .update({
        content_json: {
          ...planContent,
          sections: updatedSections,
        },
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", planId);

    if (updateError) {
      console.error(`[/api/plans/${planId}/chat] Update error:`, updateError);
      return NextResponse.json(
        { error: "Failed to update plan", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`[/api/plans/${planId}/chat] Successfully applied ${appliedChanges.length} changes`);
    console.log(`[/api/plans/${planId}/chat] Updated sections count: ${updatedSections.length}`);

    // Debug: Log a sample of the updated content
    if (updatedSections.length > 0) {
      const firstSection = updatedSections[0];
      console.log(`[/api/plans/${planId}/chat] First section sample:`, firstSection.title, firstSection.content?.substring(0, 200));
    }

    // Return response
    return NextResponse.json({
      reply: aiResponse.understood || "I've made the requested changes.",
      preview: aiResponse.preview,
      appliedChanges,
      applied: appliedChanges.length > 0,
      tokensUsed: message1.usage.input_tokens + message1.usage.output_tokens,
    });

  } catch (error: any) {
    console.error(`[/api/plans/${planId}/chat] Error:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

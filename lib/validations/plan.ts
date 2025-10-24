import { z } from "zod";

export const createPlanSchema = z.object({
  version: z.string().min(1, "Version is required"),
  prompt: z.string().min(10, "Please provide a more detailed description"),
  sections: z.array(
    z.object({
      type: z.string(),
      title: z.string(),
      content: z.string(),
      order: z.number(),
    })
  ).optional(),
});

export const updatePlanSchema = z.object({
  version: z.string().optional(),
  status: z.enum(["draft", "review", "active", "archived"]).optional(),
  content_json: z.record(z.any()).optional(),
});

export const createSectionSchema = z.object({
  section_type: z.string().min(1, "Section type is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  order: z.number().int().min(0),
});

export const updateSectionSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const createResourceSchema = z.object({
  resource_type: z.enum(["personnel", "equipment", "facility", "contact"], {
    required_error: "Resource type is required",
  }),
  name: z.string().min(1, "Name is required"),
  details: z.record(z.any()),
});

export const updateResourceSchema = z.object({
  name: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address").optional(),
  priority: z.number().int().min(1).max(10),
});

export const updateContactSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

export const createIncidentSchema = z.object({
  plan_id: z.string().uuid().optional(),
  incident_type: z.string().min(1, "Incident type is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().optional(),
});

export const updateIncidentSchema = z.object({
  status: z.enum(["active", "monitoring", "resolved"]).optional(),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const createIncidentUpdateSchema = z.object({
  update_type: z.enum(["status", "action", "resource", "photo", "note"]),
  content: z.string().min(1, "Content is required"),
  photo_url: z.string().url().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type CreateIncidentUpdateInput = z.infer<typeof createIncidentUpdateSchema>;

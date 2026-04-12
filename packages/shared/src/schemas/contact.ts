import { z } from "zod";

/**
 * Contact types and schemas for validation
 */

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Invalid email format"),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
});

export const CreateContactSchema = ContactSchema;

// Type exports
export type Contact = z.infer<typeof ContactSchema>;
export type CreateContactInput = z.infer<typeof CreateContactSchema>;

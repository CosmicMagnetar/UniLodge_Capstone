import { z } from "zod";

/**
 * Shared authentication schemas for validation across all apps
 */

export const EmailSchema = z.string().email("Invalid email address");

export const PasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const NameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters");

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const SignupSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: PasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const ChangePasswordSchema = z.object({
  currentPassword: PasswordSchema,
  newPassword: PasswordSchema,
  confirmPassword: PasswordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

// Type exports for TypeScript
export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

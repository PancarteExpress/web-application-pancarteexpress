import { z } from 'zod';

/**
 * Validation pour forgot password (demander code)
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

/**
 * Validation pour verify forgot password code
 */
export const verifyForgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
  code: z.string().min(6, 'Code invalide'),
});

export type VerifyForgotPasswordData = z.infer<typeof verifyForgotPasswordSchema>;

/**
 * Validation pour reset password
 */
export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  code: z.string().min(6, 'Code invalide'),
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
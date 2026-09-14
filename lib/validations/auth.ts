import { z } from 'zod';

/**
 * Validation pour signin
 */
export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  rememberMe: z.boolean().optional().default(false),
});

export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Validation pour signup
 */
export const signUpSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').trim(),
  lastName: z.string().min(1, 'Nom requis').trim(),
  phone: z.string().min(10, 'Numéro de téléphone invalide').trim(),
  email: z.string().email('Email invalide'),
  password: z.string().min(3, 'Le mot de passe doit contenir au moins 3 caractères'),
  companyName: z.string().optional(),
  isGroup: z.boolean(),
  groupName: z.string().optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Validation CSRF
 */
export const csrfTokenSchema = z.object({
  csrfToken: z.string().min(1, 'Token CSRF manquant'),
  csrfSecret: z.string().min(1, 'Secret CSRF manquant'),
});
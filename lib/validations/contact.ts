import { z } from 'zod';

/**
 * Validation pour envoyer email de contact
 */
export const sendContactEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  clientEmailHTML: z.string().min(1, 'HTML email requis'),
  adminEmailHTML: z.string().optional(),
});

export type SendContactEmailData = z.infer<typeof sendContactEmailSchema>;
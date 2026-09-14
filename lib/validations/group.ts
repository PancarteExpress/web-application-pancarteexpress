import { z } from 'zod';

/**
 * Validation pour groupId dans l'URL
 */
export const groupIdSchema = z.object({
  groupId: z.string().min(1, 'ID groupe requis'),
});

export type GroupIdData = z.infer<typeof groupIdSchema>;
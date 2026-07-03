import { z } from 'zod';

export const recoverRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

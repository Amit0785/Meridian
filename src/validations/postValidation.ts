import { z } from 'zod';

export const postEditorSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  content: z
    .string()
    .trim()
    .min(20, 'Post content must be at least 20 characters'),
  excerpt: z
    .string()
    .max(300, 'Excerpt cannot exceed 300 characters')
    .optional(),
  tagsInput: z.string().optional(),
  coverImage: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      'Cover image must be a valid URL starting with http:// or https://'
    )
    .optional()
    .or(z.literal('')),
  featured: z.boolean().optional(),
});

export type PostEditorFormData = z.infer<typeof postEditorSchema>;

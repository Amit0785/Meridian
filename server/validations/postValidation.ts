import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
  content: z.string().min(20, 'Post content must be at least 20 characters'),
  excerpt: z.string().max(300, 'Excerpt cannot exceed 300 characters').optional(),
  category: z.string().min(2, 'Category is required').max(40),
  tags: z.array(z.string().min(1).max(30)).max(10).optional().default([]),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  featured: z.boolean().optional().default(false),
});

export const updatePostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150).optional(),
  content: z.string().min(20, 'Post content must be at least 20 characters').optional(),
  excerpt: z.string().max(300).optional(),
  category: z.string().min(2).max(40).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().optional(),
});

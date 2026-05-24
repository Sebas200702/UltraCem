import { z } from 'zod';

export const DimensionsSchema = z.object({
  length_m: z.number().min(0.1).max(50).optional(),
  width_m: z.number().min(0.1).max(50).optional(),
  height_m: z.number().min(0.1).max(20).optional(),
  thickness_m: z.number().min(0.02).max(1).optional(),
  diameter_m: z.number().min(0.1).max(5).optional(),
  area_m2: z.number().min(0.01).max(5000).optional(),
});

export const CalculateInputSchema = z.object({
  conversationId: z.string().uuid(),
  structureType: z.enum(['slab', 'wall', 'column', 'plaster']),
  dimensions: DimensionsSchema,
  resistancePsi: z.number().min(2000).max(5000).optional(),
});

export const ChatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1).max(1000),
  userId: z.string().uuid().optional(),
});

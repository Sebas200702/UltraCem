import { z } from 'zod';

const productCategorySchema = z.enum(['structural', 'plaster', 'specialty']);

const optionalTextSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().optional(),
);

const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().url('Debe ser una URL válida.').optional(),
);

const technicalSpecsSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value ?? {};

  const trimmed = value.trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}, z.record(z.string(), z.unknown()));

export const productCreateSchema = z.object({
  sku: z.string().trim().min(2, 'SKU es requerido y debe tener al menos 2 caracteres.').max(50),
  name: z.string().trim().min(3, 'El nombre es requerido y debe tener al menos 3 caracteres.').max(255),
  category: productCategorySchema,
  subcategory: optionalTextSchema,
  technical_specs: technicalSpecsSchema.default({}),
  price_per_bag_cop: z.coerce.number().positive('El precio por bulto debe ser mayor a 0.').lt(500000),
  co2_per_kg: z.coerce.number().min(0, 'CO2 por kg no puede ser negativo.').max(2).default(0.9),
  datasheet_url: optionalUrlSchema,
  is_active: z.boolean().default(true),
});

export const productUpdateSchema = z
  .object({
    sku: z.string().trim().min(2).max(50).optional(),
    name: z.string().trim().min(3).max(255).optional(),
    category: productCategorySchema.optional(),
    subcategory: optionalTextSchema,
    technical_specs: technicalSpecsSchema.optional(),
    price_per_bag_cop: z.coerce.number().positive().lt(500000).optional(),
    co2_per_kg: z.coerce.number().min(0).max(2).optional(),
    datasheet_url: optionalUrlSchema,
    is_active: z.boolean().optional(),
    changed_by: optionalTextSchema,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe enviar al menos un campo para actualizar.',
  });

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

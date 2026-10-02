import { z } from "zod";

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().max(500).optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    parentId: z.coerce.number().int().positive().optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: createCategorySchema.body.partial(),
};

export const categoryIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const categorySlugParamSchema = {
  params: z.object({ slug: z.string().min(1) }),
};
import { z } from "zod";

export const createBrandSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    logo: z.string().url("Logo must be a valid URL").optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateBrandSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: createBrandSchema.body.partial(),
};

export const brandIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const brandStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    isActive: z.boolean(),
  }),
};
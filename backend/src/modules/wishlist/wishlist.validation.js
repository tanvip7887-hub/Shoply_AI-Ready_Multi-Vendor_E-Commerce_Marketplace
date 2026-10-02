import { z } from "zod";

export const productIdParamSchema = {
  params: z.object({
    productId: z.coerce.number().int().positive(),
  }),
};
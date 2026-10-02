import { z } from "zod";

export const addCartItemSchema = {
  body: z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  }),
};

export const updateCartItemSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  }),
};

export const cartItemIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};
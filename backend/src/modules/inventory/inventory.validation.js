import { z } from "zod";

export const updateStockSchema = {
  params: z.object({
    productId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantityChange: z.coerce.number().int(),
    reason: z.enum([
      "INITIAL_STOCK",
      "RESTOCK",
      "MANUAL_ADJUSTMENT",
      "ORDER_DEDUCTION",
      "ORDER_CANCELLATION",
      "RETURNED_ITEMS",
      "DAMAGED_ITEMS",
      "OTHER"
    ]),
    notes: z.string().max(1000).optional(),
  }),
};

export const sellerInventoryQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
    sortBy: z.enum(["updatedAt_desc", "stock_asc", "stock_desc"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

export const adminInventoryQuerySchema = {
  query: z.object({
    sellerId: z.coerce.number().int().positive().optional(),
    search: z.string().optional(),
    status: z.enum(["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
    sortBy: z.enum(["updatedAt_desc", "stock_asc", "stock_desc"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};
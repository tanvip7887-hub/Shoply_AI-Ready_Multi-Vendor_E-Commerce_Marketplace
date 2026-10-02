import { z } from "zod";

export const createProductSchema = {
  body: z
    .object({
      name: z.string().min(3, "Name must be at least 3 characters"),
      description: z.string().max(2000).optional(),
      price: z.coerce.number().positive("Price must be greater than 0"),
      discountPrice: z.coerce.number().positive().optional(),
      categoryId: z.coerce.number().int().positive(),
      brandId: z.coerce.number().int().positive().optional(),
      weight: z.coerce.number().positive().optional(),
      length: z.coerce.number().positive().optional(),
      width: z.coerce.number().positive().optional(),
      height: z.coerce.number().positive().optional(),
    })
    .refine((data) => !data.discountPrice || data.discountPrice < data.price, {
      message: "Discount price must be less than the regular price",
      path: ["discountPrice"],
    }),
};

export const updateProductSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z
    .object({
      name: z.string().min(3).optional(),
      description: z.string().max(2000).optional(),
      price: z.coerce.number().positive().optional(),
      discountPrice: z.coerce.number().positive().optional(),
      categoryId: z.coerce.number().int().positive().optional(),
      brandId: z.coerce.number().int().positive().optional(),
      weight: z.coerce.number().positive().optional(),
      length: z.coerce.number().positive().optional(),
      width: z.coerce.number().positive().optional(),
      height: z.coerce.number().positive().optional(),
    })
    .refine(
      (data) => !data.discountPrice || !data.price || data.discountPrice < data.price,
      { message: "Discount price must be less than the regular price", path: ["discountPrice"] }
    ),
};

export const productIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const productSlugParamSchema = {
  params: z.object({ slug: z.string().min(1) }),
};

export const productStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ isActive: z.boolean() }),
};

export const productQuerySchema = {
  query: z.object({
    categoryId: z.coerce.number().int().positive().optional(),
    brandId: z.coerce.number().int().positive().optional(),
    sellerId: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["price_asc", "price_desc", "newest"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

export const sellerProductQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    sortBy: z.enum(["newest", "oldest", "price_asc", "price_desc", "alphabetical"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};
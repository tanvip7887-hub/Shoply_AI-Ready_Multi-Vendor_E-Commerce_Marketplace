import { z } from "zod";

export const userIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const updateUserRoleSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ role: z.enum(["CUSTOMER", "SELLER", "ADMIN"]) }),
};

export const updateUserStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ status: z.enum(["ACTIVE", "BLOCKED"]) }),
};

export const sellerIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const productIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const productStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ isActive: z.boolean() }),
};

export const orderIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const applicationIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const rejectApplicationSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ reason: z.string().min(3, "Rejection reason is required") }),
};

export const sellerQuerySchema = {
  query: z.object({
    status: z.enum(["VERIFIED", "SUSPENDED"]).optional(),
    search: z.string().optional(),
  }),
};

export const customerQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  }),
};

export const adminProductQuerySchema = {
  query: z.object({
    isActive: z.preprocess(v => typeof v === 'string' ? v.toLowerCase() : v, z.enum(["true", "false"]).optional()),
    isDeleted: z.preprocess(v => typeof v === 'string' ? v.toLowerCase() : v, z.enum(["true", "false"]).optional()),
    sellerId: z.coerce.number().int().positive().optional(),
    status: z.preprocess(v => typeof v === 'string' ? v.toUpperCase() : v, z.enum(["PENDING", "APPROVED", "REJECTED"]).optional()),
    search: z.string().optional(),
  }),
};

export const rejectProductSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({ reason: z.string().min(3, "Rejection reason is required") }),
};

export const adminOrderQuerySchema = {
  query: z.object({
    search: z.string().optional(),
    orderStatus: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
    paymentMethod: z.enum(["COD", "ONLINE"]).optional(),
    sellerId: z.coerce.number().int().positive().optional(),
    customerId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    brandId: z.coerce.number().int().positive().optional(),
    datePreset: z.enum(["today", "yesterday", "last7days", "last30days"]).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(["newest", "oldest", "amount_high", "amount_low"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};
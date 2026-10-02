import { z } from "zod";

export const createReturnSchema = {
  body: z.object({
    orderItemId: z.number({ required_error: "OrderItem ID is required" }),
    reason: z.enum(
      ["DAMAGED_PRODUCT", "WRONG_PRODUCT", "SIZE_FIT_ISSUE", "NOT_AS_EXPECTED", "MISSING_ITEM", "OTHER"],
      { required_error: "Valid return reason is required" }
    ),
    comment: z.string().max(1000, "Comment cannot exceed 1000 characters").optional(),
  }),
};

export const rejectReturnSchema = {
  body: z.object({
    rejectionReason: z.string().min(3, "Rejection reason must be at least 3 characters").max(500),
  }),
};

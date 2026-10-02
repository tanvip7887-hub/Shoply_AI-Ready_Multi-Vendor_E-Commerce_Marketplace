import { z } from "zod";

export const applyDeliveryPartnerSchema = {
  body: z.object({
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    vehicleType: z.string().optional(),
    city: z.string().optional(),
  }),
};

export const rejectDeliveryApplicationSchema = {
  body: z.object({
    rejectionReason: z.string().min(1, "Rejection reason is required"),
  }),
};

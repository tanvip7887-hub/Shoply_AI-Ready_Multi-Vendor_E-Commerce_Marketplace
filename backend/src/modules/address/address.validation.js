import { z } from "zod";

export const addressSchema = {
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    phone: z.string().trim().regex(/^[0-9]{10,15}$/, "Please enter a valid phone number"),
    addressLine1: z.string().trim().min(5, "Address Line 1 is required and must be at least 5 characters"),
    addressLine2: z.string().trim().optional().nullable(),
    landmark: z.string().trim().optional().nullable(),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    postalCode: z.string().trim().regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit Indian PIN code"),
    country: z.string().trim().default("India"),
    type: z.enum(["HOME", "WORK", "OTHER"], {
      errorMap: () => ({ message: "Address type must be HOME, WORK, or OTHER" }),
    }).default("HOME"),
  }),
};

export const addressIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive("Invalid address ID") }),
};

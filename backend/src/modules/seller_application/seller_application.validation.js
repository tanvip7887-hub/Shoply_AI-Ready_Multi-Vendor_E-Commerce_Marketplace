import { z } from "zod";

const addressSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
    addressLine1: z.string().min(3, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(4, "Postal code is required"),
    country: z.string().optional(),
});

export const saveDraftSchema = {
    body: z.object({
        businessName: z.string().min(2).optional(),
        ownerName: z.string().min(2).optional(),
        mobileNumber: z.string().min(10).max(15).optional(),
        businessType: z.enum(["INDIVIDUAL", "SOLE_PROPRIETORSHIP", "PARTNERSHIP", "PRIVATE_LIMITED", "LLP", "OTHER"]).optional(),
        gstNumber: z.string().optional(),
        panNumber: z.string().optional(),
        businessDescription: z.string().max(1000).optional(),
        address: addressSchema.partial().optional(),
    }),
};

export const submitApplicationSchema = {
    body: z.object({
        businessName: z.string().min(2, "Business name is required"),
        ownerName: z.string().min(2, "Owner name is required"),
        mobileNumber: z.string().min(10, "Phone must be at least 10 digits").max(15),
        businessType: z.enum(["INDIVIDUAL", "SOLE_PROPRIETORSHIP", "PARTNERSHIP", "PRIVATE_LIMITED", "LLP", "OTHER"]),
        gstNumber: z.string().optional(),
        panNumber: z.string().optional(),
        businessDescription: z.string().max(1000).optional(),
        address: addressSchema,
    }),
};
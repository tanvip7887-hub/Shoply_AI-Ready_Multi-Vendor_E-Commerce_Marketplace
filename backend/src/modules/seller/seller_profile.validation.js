import { z } from "zod";

export const updateSellerProfileSchema = {
    body: z.object({
        ownerName: z.string().min(2, "Full name is required").optional(),
        mobileNumber: z.string().min(10, "Phone must be at least 10 digits").max(15).optional(),
        businessName: z.string().min(2, "Business name is required").optional(),
        displayName: z.string().min(2).optional(),
        gstNumber: z.string().optional(),
        panNumber: z.string().optional(),
        address: z
            .object({
                addressLine1: z.string().min(3, "Address is required"),
                city: z.string().min(2, "City is required"),
                state: z.string().min(2, "State is required"),
                postalCode: z.string().min(4, "Pincode is required"),
            })
            .partial()
            .optional(),
    }),
};
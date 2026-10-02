import { z } from "zod";

export const updateProfileSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z.string().min(10, "Phone must be at least 10 digits").max(15).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: z.string().optional(), // ISO date string from a date input
  }),
};
const addressBody = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  addressLine1: z.string().min(3, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().optional(),
  type: z.enum(["HOME", "WORK", "OTHER"]).optional(),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = { body: addressBody };

export const updateAddressSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: addressBody.partial(), // all fields optional on update
};

export const addressIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};
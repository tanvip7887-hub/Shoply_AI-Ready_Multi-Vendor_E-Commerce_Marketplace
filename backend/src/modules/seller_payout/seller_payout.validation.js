import { z } from "zod";

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const bankAccountSchema = {
    body: z
        .object({
            accountHolderName: z.string().trim().min(2, "Account holder name is required"),
            bankName: z.string().trim().min(2, "Bank name is required"),
            accountNumber: z.string().trim().min(6, "Account number looks too short").max(20),
            confirmAccountNumber: z.string().trim().min(6),
            ifscCode: z.string().trim().toUpperCase().regex(ifscRegex, "Invalid IFSC code format"),
        })
        .refine((data) => data.accountNumber === data.confirmAccountNumber, {
            message: "Account numbers do not match",
            path: ["confirmAccountNumber"],
        }),
};
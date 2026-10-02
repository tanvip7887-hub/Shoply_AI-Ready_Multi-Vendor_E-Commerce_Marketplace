import { z } from "zod";

export const createOrderSchema = {
  body: z.object({
    addressId: z.coerce.number().int().positive(),
    paymentMethod: z.enum(["COD", "ONLINE"]).optional(),
  }),
};

export const orderIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const sellerOrderStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    orderStatus: z.enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "READY_TO_SHIP",
      "PICKUP_CREATED",
      "OUT_FOR_PICKUP",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
  }),
};
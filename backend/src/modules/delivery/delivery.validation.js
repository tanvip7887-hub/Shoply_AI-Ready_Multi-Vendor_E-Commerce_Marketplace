import { z } from "zod";

export const shipmentIdParamSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
};

export const updateShipmentStatusSchema = {
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    shipmentStatus: z.enum([
      "OUT_FOR_PICKUP",
      "PICKED_UP",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ]),
  }),
};

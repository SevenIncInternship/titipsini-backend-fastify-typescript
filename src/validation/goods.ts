import { z } from "zod";

export const goodsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  vendorBranchId: z.string().uuid("Vendor ID must be a valid UUID"),
  categoryId: z.string().uuid("Category ID must be a valid UUID"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  dateIn: z.coerce.date("Date in must be a valid date"),
  dateOut: z.coerce.date("Date in must be a valid date"),
  paymentMethod: z.enum(
    ["cash", "transfer"],
    "Payment method must be 'cash' or 'transfer'"
  ),
  bank: z
    .enum(
      ["bca", "bni", "bri", "mandiri"],
      "Bank must be 'bca', 'bni', 'bri', or 'mandiri'"
    )
    .optional(),
});

import { z } from "zod";

export const vendorSchema = z.object({
  companyName: z.string().min(2, "Name must be at least 2 characters"),
  companyAddress: z.string().min(5, "Address must be at least 5 characters"),
});
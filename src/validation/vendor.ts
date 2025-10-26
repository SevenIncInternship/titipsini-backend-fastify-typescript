import { z } from "zod";

export const vendorSchema = z.object({
  companyName: z.string().min(2, "Name must be at least 2 characters"),
  companyAddress: z.string().min(5, "Address must be at least 5 characters"),
});


export const vendorBranchSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});
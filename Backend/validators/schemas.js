import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["wholesaler", "retailer"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive("Price must be a positive number").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must contain at least one item"),
});

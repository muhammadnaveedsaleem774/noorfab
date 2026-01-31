import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject must be at least 2 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const checkoutFormSchema = z.object({
  email: z.string().email("Invalid email"),
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(8, "Valid phone number is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State / Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type ShippingAddressValues = z.infer<typeof shippingAddressSchema>;
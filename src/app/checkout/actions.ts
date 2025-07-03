
'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';
import type { CartItem, CouponDiscount } from '@/types';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const checkoutActionInputSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  cartDetails: z.object({
    cartItems: z.array(z.any()), // Not strictly validating cart items from client
    subtotal: z.number(),
    discountAmount: z.number(),
    total: z.number(),
    appliedCoupon: z.any().optional().nullable(),
  })
});

type CheckoutActionInput = z.infer<typeof checkoutActionInputSchema>;

export async function processCheckoutAndSendEmail(input: CheckoutActionInput) {
  // Check if Resend API key is available
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Skipping email sending. This is normal for a demo without an API key.");
    // In a demo environment, we can treat this as a success so the user flow isn't blocked.
    // In a real production app, you might want to throw an error or have more robust logging.
    return { success: true };
  }

  try {
    const validation = checkoutActionInputSchema.safeParse(input);
    if (!validation.success) {
      throw new Error('Invalid input for checkout action.');
    }
    
    const { email, fullName, cartDetails } = validation.data;
    const { cartItems, subtotal, discountAmount, total, appliedCoupon } = cartDetails;
    
    const orderId = `CS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { data, error } = await resend.emails.send({
      // IMPORTANT: For production, you must replace 'onboarding@resend.dev' with a verified domain.
      from: 'CodiStyle <onboarding@resend.dev>',
      to: [email],
      subject: `Your CodiStyle Order Confirmation (#${orderId})`,
      react: OrderConfirmationEmail({
        customerName: fullName,
        orderId,
        orderDate,
        cartItems: cartItems as CartItem[],
        subtotal,
        shipping: 0, // Assuming free shipping
        discountAmount,
        total,
        appliedCoupon: appliedCoupon as { code: string; discount: CouponDiscount } | null,
      }),
    });

    if (error) {
      console.error('Email sending failed:', error);
      // Even if email fails, we might want to let the order "succeed" on the frontend
      // but we should log this failure for ops to investigate.
      // For this demo, we'll throw an error to notify the user.
      throw new Error('Could not send confirmation email.');
    }

    console.log('Email sent successfully:', data);
    return { success: true };

  } catch (error) {
    console.error('Checkout processing error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during checkout.';
    return { success: false, error: message };
  }
}

'use server';

import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/components/emails/order-confirmation-email';
import type { CartItem, CouponDiscount, Transaction, SalesData } from '@/types';
import { z } from 'zod';
import { getSalesData } from '@/lib/sales';
import { addTransaction } from '@/lib/transactions';

const resend = new Resend(process.env.RESEND_API_KEY);

const checkoutActionInputSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  cartDetails: z.object({
    cartItems: z.array(z.any()), // Not strictly validating cart items from client
    subtotal: z.number(),
    discountAmount: z.number(),
    shipping: z.number(),
    total: z.number(),
    appliedCoupon: z.any().optional().nullable(),
  })
});

type CheckoutActionInput = z.infer<typeof checkoutActionInputSchema>;

export async function processCheckoutAndSendEmail(input: CheckoutActionInput) {
    const validation = checkoutActionInputSchema.safeParse(input);
    if (!validation.success) {
      throw new Error('Invalid input for checkout action.');
    }
    
    const { email, fullName, cartDetails } = validation.data;
    const { cartItems, subtotal, discountAmount, shipping, appliedCoupon } = cartDetails;
    
    const orderId = `CS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // --- Dynamic Tax Calculation ---
    const salesData: SalesData = getSalesData();
    const latestMonthSales = salesData.monthlyTrend[salesData.monthlyTrend.length - 1];
    // Assuming the currency of sales data and tax thresholds are consistent.
    const monthlyRevenue = parseInt(latestMonthSales.revenue.replace(/[^\d]/g, ''), 10);
    
    let taxRate = 0;
    if (monthlyRevenue >= 200000) {
      taxRate = 0.05; // 5% tax
    } else if (monthlyRevenue >= 100000) {
      taxRate = 0.01; // 1% tax
    }
    // if less than 100,000, taxRate remains 0.

    const taxableAmount = subtotal - discountAmount;
    const taxes = taxableAmount > 0 ? taxableAmount * taxRate : 0;
    const newTotal = taxableAmount + shipping + taxes;

    const newTransaction: Transaction = {
        orderId,
        customer: fullName,
        email,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        subtotal,
        shipping,
        taxes,
        total: newTotal,
    };

  try {
    // Save to Firestore.
    await addTransaction(newTransaction);
    
    // Check if Resend API key is available
    if (process.env.RESEND_API_KEY) {
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
            shipping,
            discountAmount,
            taxes,
            total: newTotal,
            appliedCoupon: appliedCoupon as { code: string; discount: CouponDiscount } | null,
          }),
        });

        if (error) {
          console.error('Email sending failed:', error);
          // Still return success if DB write was successful but email failed
        } else {
          console.log('Email sent successfully:', data);
        }
    } else {
      console.warn("RESEND_API_KEY is not set. Skipping email sending.");
    }

    return { success: true, newTransaction };

  } catch (error) {
    console.error('Checkout processing error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred during checkout.';
    return { success: false, error: message };
  }
}

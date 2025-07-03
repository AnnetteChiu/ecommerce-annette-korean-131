'use server';

import { Resend } from 'resend';
import { DiscountCodeEmail } from '@/components/emails/discount-code-email';
import type { CouponDiscount } from '@/types';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendDiscountCodeEmailSchema = z.object({
  email: z.string().email(),
  couponCode: z.string(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number(),
  }),
});

type SendDiscountCodeEmailInput = z.infer<typeof sendDiscountCodeEmailSchema>;

export async function sendDiscountCodeEmail(input: SendDiscountCodeEmailInput) {
    const validation = sendDiscountCodeEmailSchema.safeParse(input);
    if (!validation.success) {
      throw new Error('Invalid input for sending discount code email.');
    }

    const { email, couponCode, discount } = validation.data;
    
    // Check if Resend API key is available
    if (process.env.RESEND_API_KEY) {
        try {
          const { data, error } = await resend.emails.send({
            from: 'CodiStyle <onboarding@resend.dev>',
            to: [email],
            subject: `Your Discount Code from CodiStyle is Here!`,
            react: DiscountCodeEmail({
              couponCode,
              discount: discount as CouponDiscount,
            }),
          });

          if (error) {
            console.error('Email sending failed:', error);
            throw new Error('Could not send discount code email.');
          }

          console.log('Discount email sent successfully:', data);

        } catch (error) {
          console.error('Email sending process error:', error);
          const message = error instanceof Error ? error.message : 'An unknown error occurred while sending the email.';
          return { success: false, error: message };
        }
    } else {
        console.warn("RESEND_API_KEY is not set. Skipping email sending.");
        // To provide feedback in the UI even without the key, we can return a success message.
        return { success: true, message: 'Email sending is disabled (no API key), but the action was successful.' };
    }

    return { success: true, message: `Discount code sent to ${email}.` };
}

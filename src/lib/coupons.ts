import type { CouponDiscount } from '@/types';

interface CouponValidationResult {
  success: boolean;
  discount?: CouponDiscount;
  message: string;
}

const mockCoupons: { [code: string]: CouponDiscount } = {
  'SALE10': { type: 'percentage', value: 10 },
  '50OFF': { type: 'fixed', value: 50 },
  'SUPERDEAL': { type: 'percentage', value: 25 },
};

/**
 * This is a mock function to validate a coupon code.
 * In a real application, this would be a server action that calls an external API.
 * 
 * @param code The coupon code entered by the user.
 * @returns A result object indicating if the coupon is valid and the discount details.
 */
export function validateCoupon(code: string): CouponValidationResult {
  const upperCaseCode = code.toUpperCase();
  const discount = mockCoupons[upperCaseCode];

  if (discount) {
    let message = '';
    if (discount.type === 'percentage') {
      message = `Success! You get ${discount.value}% off your order.`;
    } else {
      message = `Success! You get $${discount.value.toFixed(2)} off your order.`;
    }
    return {
      success: true,
      discount,
      message,
    };
  }

  return {
    success: false,
    message: 'Invalid or expired coupon code.',
  };
}

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
 * Retrieves custom coupons from localStorage.
 * This should only be called on the client-side.
 * @returns An object of custom coupons.
 */
function getCustomCoupons(): { [code: string]: CouponDiscount } {
    try {
        const customCouponsStr = localStorage.getItem('customCoupons');
        return customCouponsStr ? JSON.parse(customCouponsStr) : {};
    } catch (error) {
        console.error("Failed to parse custom coupons from localStorage", error);
        return {};
    }
}

/**
 * Retrieves all coupons, merging mock coupons with custom ones from localStorage.
 * @returns An object of all available coupons with a flag indicating their source.
 */
export function getCoupons(): { [code: string]: CouponDiscount & { isMock?: boolean } } {
    const customCoupons = getCustomCoupons();
    const allCoupons: { [code: string]: CouponDiscount & { isMock?: boolean } } = {};

    for (const code in mockCoupons) {
        allCoupons[code] = { ...mockCoupons[code], isMock: true };
    }
    for (const code in customCoupons) {
        allCoupons[code] = { ...customCoupons[code], isMock: false };
    }
    
    return allCoupons;
}

/**
 * Adds a new custom coupon to localStorage.
 * This should only be called on the client-side.
 * @param code The coupon code.
 * @param discount The discount details.
 * @returns True if the coupon was added, false if it already exists.
 */
export function addCoupon(code: string, discount: CouponDiscount): boolean {
    const allCoupons = getCoupons();
    if (allCoupons[code]) {
        return false; // Coupon already exists
    }

    const customCoupons = getCustomCoupons();
    customCoupons[code] = discount;

    try {
        localStorage.setItem('customCoupons', JSON.stringify(customCoupons));
        return true;
    } catch (error) {
        console.error("Failed to save custom coupon to localStorage", error);
        return false;
    }
}


/**
 * This function validates a coupon code against mock coupons and custom ones in localStorage.
 * In a real application, this would be a server action that calls an external API.
 * 
 * @param code The coupon code entered by the user.
 * @returns A result object indicating if the coupon is valid and the discount details.
 */
export function validateCoupon(code: string): CouponValidationResult {
  const upperCaseCode = code.toUpperCase();
  const allCoupons = getCoupons();
  const discount = allCoupons[upperCaseCode];

  if (discount) {
    let message = '';
    if (discount.type === 'percentage') {
      message = `Success! You get ${discount.value}% off your order.`;
    } else {
      message = `Success! You get $${discount.value.toFixed(2)} off your order.`;
    }
    
    // Don't return the `isMock` property in the validation result
    const { isMock, ...discountDetails } = discount;
    return {
      success: true,
      discount: discountDetails,
      message,
    };
  }

  return {
    success: false,
    message: 'Invalid or expired coupon code.',
  };
}

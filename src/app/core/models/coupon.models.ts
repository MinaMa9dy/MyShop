export interface Coupon {
  couponCode: string; // Guid
  discountType: number; // Enum: 1 for Percentage, 2 for FixedAmount (based on your backend)
  discountValue: number;
  couponName: string;
  couponDescription?: string;
  minAmount: number;
  createdDate: string;
  expirationDate?: string;
  isActive: boolean;
}

export interface CouponResponse {
  coupon: Coupon;
  totalDiscount: number;
  finalSubtotal: number;
  itemPrices: { [key: string]: number }; // Dictionary for ProductId -> Price mapping
}

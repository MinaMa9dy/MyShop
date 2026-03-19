export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2
}

export interface Coupon {
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  couponName: string;
  couponDescription?: string;
  minAmount: number;
  createdDate: string;
  expirationDate?: string;
  isActive: boolean;
}

export interface CreateCouponDto {
  discountType: DiscountType;
  discountValue: number;
  couponName: string;
  couponDescription?: string;
  minAmount: number;
  expirationDate?: string;
  isActive: boolean;
}

export interface UpdateCouponDto {
  discountType: DiscountType;
  discountValue: number;
  couponName: string;
  couponDescription?: string;
  minAmount: number;
  expirationDate?: string;
  isActive: boolean;
}

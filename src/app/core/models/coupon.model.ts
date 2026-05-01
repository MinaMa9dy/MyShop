import { Result } from "./result.model";

export enum DiscountType {
  Percentage = 1,
  FixedAmount = 2
}

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  couponDescription: string;
  minAmount: number;
  createdDate: string;
  expirationDate?: string;
  isActive: boolean;
  usedCount: number;
  usageLimit?: number;
}

export interface CreateCouponDto {
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  couponDescription?: string;
  minAmount: number;
  expirationDate?: string;
  isActive: boolean;
  usageLimit?: number;
}

export interface UpdateCouponDto {
  couponCode: string;
  discountType: DiscountType;
  discountValue: number;
  couponDescription?: string;
  minAmount: number;
  expirationDate?: string;
  isActive: boolean;
  usageLimit?: number;
}

export interface UserCouponDto {
  id: number;
  customerId: string;
  customerName: string;
  coupon: Coupon;
  canUse: boolean;
  userUsageCount: number;
  usageLimit?: number;
  assignedAt: string;
}

export interface AssignCouponDto {
  couponId: string;
  userId: string;
  usageLimit?: number;
}

export interface BulkAssignCouponDto {
  couponId: string;
  userIds?: string[];
  usageLimit?: number;
}

export interface BulkAssignResultDto {
  totalProcessed: number;
  alreadyAssigned: number;
  newlyAssigned: number;
}

export interface CouponResponseDto {
  coupon: Coupon;
  totalDiscount: number;
  finalSubtotal: number;
  itemPrices: { [key: string]: number };
}

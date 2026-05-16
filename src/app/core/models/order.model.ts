export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productDescription?: string;
  productPhotoPath?: string;
  productPhotoContentType?: string;
}

export interface Order {
  id: string;
  customerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  createdAt: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  appliedCouponCode?: string;
  status: string;
  city: CityOption;
  street: string;
  comment?: string;
  orderItems: OrderItem[];
}

export interface AddOrderDto {
  customerId: string;
  city: CityOption;
  street: string;
  phoneNumber: string;
  comment?: string;
  couponId?: string;
}

export type CityOption = 
  | 'Dakahliya' 
  | 'Cairo' 
  | 'Giza' 
  | 'Alex' 
  | 'Aswan' 
  | 'Luxor';

export const CITIES: CityOption[] = ['Dakahliya', 'Cairo', 'Giza', 'Alex', 'Aswan', 'Luxor'];

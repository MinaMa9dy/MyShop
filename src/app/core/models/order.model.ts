export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productDescription?: string;
  productPhotoPath?: string;
  productPhotoContentType?: string;
}

export interface Order {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  createdAt: Date;
  totalAmount: number;
  status: string;
  city: CityOption;
  street: string;
  comment?: string;
  orderItems: OrderItem[];
}

export interface AddOrderDto {
  userId: string;
  city: CityOption;
  street: string;
  phoneNumber: string;
  comment?: string;
}

export type CityOption = 
  | 'Dakahliya' 
  | 'Cairo' 
  | 'Giza' 
  | 'Alex' 
  | 'Aswan' 
  | 'Luxor';

export const CITIES: CityOption[] = ['Dakahliya', 'Cairo', 'Giza', 'Alex', 'Aswan', 'Luxor'];

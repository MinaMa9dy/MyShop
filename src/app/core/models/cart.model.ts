export interface CartItem {
  productId: string;
  customerId: string;
  quantity: number;
  // Additional properties for display
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export interface AddToCartDto {
  productId: string;
  customerId: string;
  quantity: number;
}

export interface UpdateCartDto {
  productId: string;
  customerId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartItem {
  productId: string;
  userId: string;
  quantity: number;
  // Additional properties for display
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export interface AddToCartDto {
  productId: string;
  userId: string;
  quantity: number;
}

export interface UpdateCartDto {
  productId: string;
  userId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

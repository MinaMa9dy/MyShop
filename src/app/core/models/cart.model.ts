export interface CartItem {
  productVariantId: string;
  productName: string;
  sku: string;
  price: number;
  photoUrl: string;
  quantity: number;

  // UI helpers (may be derived or legacy support)
  productPrice?: number;
  productImage?: string;
  variantDetails?: string;
}

export interface CartItemCreateDto {
  productVariantId: string;
  quantity: number;
}

export interface CartItemUpdateDto {
  productVariantId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

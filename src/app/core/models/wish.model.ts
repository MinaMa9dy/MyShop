import { Product } from './product.model';

export interface Wish {
  customerId: string;
  productId: string;
  product?: Product;
}

export interface WishDto {
  customerId?: string;
  productId: string;
}

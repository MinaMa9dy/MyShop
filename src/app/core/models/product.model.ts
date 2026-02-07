export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number; // May not exist in backend
  newPrice: number; // Backend returns this
  categoryId: string;
  category?: string; // Backend returns category name directly
  categoryName?: string;
  supplier?: string;
  supplierId?: string;
  quantityInStock?: number;
  shownQuantity: number; // Backend returns this
  productPhotos?: ProductPhoto[];
  productphotos?: ProductPhoto[]; // Backend uses lowercase
  createdAt?: string;
  updatedAt?: string;
  isOnSale?: boolean;
  haveSale: boolean; // Backend returns this
  rating?: number;
  reviewCount: number;
  popularity: number;
  isFasting?: boolean; // New property
  oldPrice?: number; // Backend returns this for sale display
}

export interface ProductPhoto {
  id: string;
  url: string;
  isMain: boolean;
}

export interface AddProductDto {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  supplier?: string;
  quantityInStock: number;
  isOnSale?: boolean;
  isFasting?: boolean; // New property
}

export interface UpdateProductDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  supplier?: string;
  quantityInStock: number;
  isOnSale?: boolean;
  isFasting?: boolean; // New property
}

export interface DeleteProductDto {
  id: string;
}

export interface GetProductDto {
  id: string;
  name: string;
  description?: string;
  newPrice: number;
  haveSale: boolean;
  popularity: number;
  shownQuantity: number;
  reviewCount: number;
  supplierId?: string;
  categoryId: string;
  productPhotos?: ProductPhoto[];
  productphotos?: ProductPhoto[];
  isFasting?: boolean; // New property
}

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductResponse {
  items: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

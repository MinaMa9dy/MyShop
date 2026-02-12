export interface Wish {
  userId: string;
  productId: string;
  product?: ProductWishInfo;
  createdAt?: string;
}

export interface ProductWishInfo {
  id: string;
  name: string;
  description?: string;
  newPrice: number;
  haveSale: boolean;
  oldPrice?: number;
  categoryName?: string;
  productPhotos?: ProductPhotoWish[];
}

export interface ProductPhotoWish {
  id: string;
  productId: string;
  fileName: string;
  relativePath: string;
  contentType: string;
  fileSize: number;
  isMain: boolean;
  url?: string;
}

export interface AddWishDto {
  userId: string;
  productId: string;
}

export interface WishListResponse {
  items: Wish[];
  totalCount: number;
}



export interface Product {
  id: string;
  name: string;
  description?: string;
  reviewCount: number;
  popularity: number;
  haveSale: boolean;
  isFasting: boolean;
  supplierId: string;
  supplierName: string;
  supplierLogoUrl?: string;
  categoryId: string;
  categoryName: string;
  averageRating: number;
  
  // Top-level price info for catalog display (Populated from variants during normalization)
  oldPrice: number;
  newPrice: number;
  stockQuantity: number;

  productPhotos: ProductPhoto[];
  productVariants: ProductVariant[];
  attributeSummary?: { name: string, values: string[] }[];
}

export interface ProductPhoto {
  id: string;
  url: string;
  isMain: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  oldPrice: number;
  newPrice: number;
  stockQuantity: number;
  attributes: VariantAttribute[];
}

export interface VariantAttribute {
  attributeId: string;
  attributeName: string;
  value: string;
}

export interface AddProductDto {
  name: string;
  description?: string;
  categoryId: string;
  supplierId: string;
  isFasting: boolean;
  haveSale: boolean;
  popularity: number;
  photos?: File[];
}

export interface UpdateProductDto {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  supplierId?: string;
  isFasting?: boolean;
  haveSale?: boolean;
  popularity?: number;
  photos?: File[];
  photoIdsToDelete?: string[];
}

export interface AddProductVariantDto {
  sku: string;
  price: number;
  stockQuantity: number;
  attributes: AddVariantAttributeDto[];
}

export interface AddVariantAttributeDto {
  attributeId: string;
  value: string;
}

export interface ProductFilter {
  searchTerm?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFasting?: boolean;
  haveSale?: boolean;
  pageNumber?: number;
  pageSize?: number;
}


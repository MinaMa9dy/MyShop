export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Category[];
  productsCount?: number;
}

export interface AddCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateCategoryDto {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface CategoryTree {
  id: string;
  name: string;
  children?: CategoryTree[];
}

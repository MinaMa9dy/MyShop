export interface Review {
  id: string;
  productId: string;
  customerId: string;
  personName: string;
  photoUrl?: string;
  content: string;
  stars: number;
  createdAt: Date;
}

export interface AddReviewDto {
  productId: string;
  customerId: string;
  stars: number;
  content: string;
}

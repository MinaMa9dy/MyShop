export interface Review {
  id: string;
  productId: string;
  userId: string;
  personName: string;
  content: string;
  stars: number;
  createdAt: Date;
}

export interface AddReviewDto {
  productId: string;
  userId: string;
  stars: number;
  content: string;
}

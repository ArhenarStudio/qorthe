export interface Review {
  id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  response?: string;
  createdAt: string;
  updatedAt?: string;
}

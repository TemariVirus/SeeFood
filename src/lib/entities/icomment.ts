export interface IComment {
  id: number;
  content?: string;
  rating?: number;
  date: Date;
  userId: number;
  userName: string;
  restaurantId: number;
  reviewId?: number;
  isReply: boolean;
}

export interface IComment {
  id: number;
  content?: string;
  rating?: number;
  parentId: number;
  date: Date;
  userId: number;
  userName: string;
  isReply: boolean;
}

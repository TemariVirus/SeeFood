export interface IComment {
  id: number;
  content?: string;
  rating?: number;
  parent_id: number;
  date: Date;
  user_id: number;
  username: string;
  is_reply: boolean;
}

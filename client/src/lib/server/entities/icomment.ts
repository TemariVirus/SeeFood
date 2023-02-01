export interface IComment {
  id: number;
  content?: string;
  rating?: number;
  parent_id: number;
  date: Date;
  user_id: number;
  user_name: string;
  is_reply: boolean;
}

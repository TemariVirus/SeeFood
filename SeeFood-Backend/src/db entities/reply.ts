import Entity from ".";

export class Reply implements Entity {
    static readonly tableName = "replies";
    static readonly autoIncColumns: (keyof Reply)[] = ["id"];
    static readonly requiredColumns: (keyof Reply)[] = ["content", "date", "user_id", "review_id"];
    
    id: number;
    content: string;
    date: Date;
    user_id: number;
    review_id: number;
}
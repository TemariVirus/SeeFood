import Entity from ".";

export class Review implements Entity {
    static readonly tableName = "reviews";
    static readonly autoIncColumns: (keyof Review)[] = ["id"];
    static readonly requiredColumns: (keyof Review)[] = ["rating", "restaurant_id", "date", "user_id"];

    id: number;
    content?: string;
    rating: number;
    restaurant_id: number;
    date: Date;
    user_id: number;
}
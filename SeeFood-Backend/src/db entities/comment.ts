import Entity from ".";
import { z } from "zod";

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

const newCommentRequest = z.object({
    content: z.string().optional(),
    rating: z.number().int().min(0).max(5).optional(),
    parent_id: z.number().int(),
    user_id: z.number().int(),
    is_reply: z.boolean(),
}).refine(data => data.is_reply === (data.rating === undefined), {
    message: "Reviews must have ratings, and replies cannot have ratings",
    path: ["rating"]
}).refine(data => !data.is_reply || (data.content !== undefined), {
    message: "Replies must have content.",
    path: ["content"]
});

export class Comment {
    id: number;
    content?: string;
    rating?: number;
    parent_id: number;
    date: Date;
    user_id: number;
    is_reply: boolean;

    static parseAsDbEntity(comment): Review | Reply {
        const { content, rating, parent_id, user_id, is_reply } = newCommentRequest.parse(comment);
        // Create comment
        const entity = is_reply ? new Reply() : new Review();
        entity.content = content;
        entity.user_id = user_id;
        entity.date = new Date(Date.now());
        if (entity instanceof Reply)
            entity.review_id = parent_id;
        else {
            entity.restaurant_id = parent_id;
            entity.rating = rating;
        }

        return entity;
    }
}
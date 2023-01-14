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

const updateCommentRequest = z.object({
    content: z.string().optional(),
    rating: z.number().int().min(0).max(5).optional(),
    is_reply: z.boolean(),
}).refine(data => !data.is_reply || !data.rating, {
    message: "Replies cannot have ratings",
    path: ["rating"]
});

export class Comment {
    id: number;
    content?: string;
    rating?: number;
    parent_id: number;
    date: Date;
    user_id: number;
    is_reply: boolean;

    static fromNewRequest(request): Review | Reply {
        // Ensure request is formatted correctly
        const result = newCommentRequest.safeParse(request);
        if (!result.success)
            return null;

        // Create comment
        const { content, rating, parent_id, user_id, is_reply } = result.data;
        const comment = is_reply ? new Reply() : new Review();
        comment.content = content;
        comment.user_id = user_id;
        comment.date = new Date(Date.now());
        if (comment instanceof Reply)
            comment.review_id = parent_id;
        else {
            comment.restaurant_id = parent_id;
            comment.rating = rating;
        }

        return comment;
    }

    static fromUpdateRequest(request): Review | Reply {
        // Ensure request is formatted correctly
        const result = updateCommentRequest.safeParse(request);
        if (!result.success)
            return null;

        // Create comment
        const { content, rating, is_reply } = result.data;
        const comment = is_reply ? new Reply() : new Review();
        comment.content = content;
        if (comment instanceof Review)
            comment.rating = rating;

        return comment;
    }
}
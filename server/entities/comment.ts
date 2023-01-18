import Entity from ".";
import { Query } from "../db-query/query";
import { z } from "zod";

declare module '../db-query/query' {
    interface Query<T> {
        toCommentArray(): Promise<T[]>;
    }
}

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

    static {
        Query.prototype.toCommentArray = function (this: Query<any>) {
            return this
                .toArray()
                .then(comments => (comments as any[]).map(c => {
                    return {
                        ...c,
                        content: c.content ??= undefined,
                        rating: c.rating ??= undefined,
                        date: c.date.getTime(),
                        is_reply: c.is_reply === 1
                    };
                }))
        }
    }

    static fromNewRequest(request: z.infer<typeof newCommentRequest>) {
        let result = {} as { data: any, success: boolean };
        try {
            // Ensure request is formatted correctly
            const { content, rating, parent_id, user_id, is_reply } = newCommentRequest.parse(request);
            // Create comment
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

            result.data = comment;
            result.success = true;
        } catch (e) {
            result.data = e.issues;
            result.success = false;
        } finally {
            return result;
        }
    }

    static fromUpdateRequest(request: z.infer<typeof updateCommentRequest>) {
        let result = {} as { data: any, success: boolean };
        try {
            // Ensure request is formatted correctly
            const { content, rating, is_reply } = updateCommentRequest.parse(request);
            // Create comment
            const comment = is_reply ? new Reply() : new Review();
            if (content)
                comment.content = content;
            if (comment instanceof Review && rating)
                comment.rating = rating;

            result.data = comment;
            result.success = true;
        } catch (e) {
            result.data = e.issues;
            result.success = false;
        } finally {
            return result;
        }
    }
}
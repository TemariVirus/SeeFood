import HttpStatusCodes from "$lib/httpStatusCodes";
import {
  parseId,
  RestaurantController,
  UserController,
  handleZodParse,
} from ".";
import Query, { SqlOperators, JoinType, UnionType } from "$lib/server/db-query";
import type { IComment } from "$lib/server/entities";

import { error } from "@sveltejs/kit";
import { z } from "zod";

declare module "$lib/server/db-query/query" {
  interface Query {
    toCommentArray(data?: any[] | undefined): Promise<IComment[]>;
  }
}

declare global {
  interface Array<T> {
    groupComments(
      this: IComment[]
    ): { review: IComment; replies: IComment[] }[];
  }
}

const newCommentRequest = z
  .object({
    content: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === "" ? undefined : s)),
    rating: z.number().int().min(0).max(5).optional(),
    parentId: z.number().int(),
    userId: z.number().int(),
    isReply: z.boolean(),
  })
  .refine((data) => data.isReply === (data.rating === undefined), {
    message: "Reviews must have ratings, and replies cannot have ratings",
    path: ["rating"],
  })
  .refine((data) => !data.isReply || data.content !== undefined, {
    message: "Replies must have content.",
    path: ["content"],
  })
  .transform((data) =>
    data.isReply
      ? {
          content: data.content,
          date: new Date(),
          user_id: data.userId,
          review_id: data.parentId,
        }
      : {
          content: data.content,
          rating: data.rating,
          date: new Date(),
          user_id: data.userId,
          restaurant_id: data.parentId,
        }
  );

const updateCommentRequest = z
  .object({
    content: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s === "" ? undefined : s)),
    rating: z.number().int().min(0).max(5).optional(),
    is_reply: z.boolean(),
  })
  .refine((data) => !data.is_reply || !data.rating, {
    message: "Replies cannot have ratings",
    path: ["rating"],
  })
  .transform((data) => ({
    isReply: data.is_reply,
    comment: {
      content: data.content,
      rating: data.rating,
    },
  }));

export default class CommentController {
  public static readonly ReviewTableName = "reviews";
  public static readonly ReplyTableName = "replies";
  public static readonly tableName = "comments";

  static {
    Query.prototype.toCommentArray = async function (
      this: Query,
      data?: any[] | undefined
    ) {
      const comments = await Query.select("r.*", "user_name")
        .from(this.as("r"))
        .join(
          JoinType.INNER_JOIN,
          Query.select("id", "`name` AS user_name")
            .from(UserController.tableName)
            .as("u"),
          "r.user_id",
          SqlOperators.EQUAL,
          "u.id"
        )
        .toArray(data);
      return (comments as any[]).map(CommentController.entityToComment);
    };

    Array.prototype.groupComments = function () {
      // Sort by latest first
      this.sort((a, b) => b.date.valueOf() - a.date.valueOf());

      const reviews = this.filter((c) => !c.isReply && c.content !== null);
      // Sort replies by parent id to easily split them
      // (Satble sort is guarenteed on ECMAScript 2019 and above)
      const replies = this.filter((c) => c.isReply)
        .reverse() // Reverse so that replies are by earliest first
        .sort((a, b) => a.parentId - b.parentId);

      if (replies.length === 0)
        return reviews.map((review) => ({ review, replies: [] }));

      // Get array of indices where parent id changes
      const splits = replies.reduce(
        (acc, reply, i) => {
          // Skip first element
          if (i === 0) return acc;

          if (replies[i - 1].parentId !== reply.parentId) acc.push(i);
          return acc;
        },
        [0]
      );
      splits.push(replies.length);

      // Group replies with their parent review
      let j = 0;
      return reviews.map((review) => {
        return {
          review,
          replies:
            replies[splits[Math.min(j, splits.length - 2)]].parentId ===
            review.id
              ? replies.slice(splits[j], splits[++j])
              : [],
        };
      }, []);
    };
  }

  private static entityToComment(entity: any): IComment {
    return {
      id: entity.id,
      content: entity.content ?? undefined,
      rating: entity.rating ?? undefined,
      parentId: entity.parent_id,
      date: entity.date.getTime(),
      userId: entity.user_id,
      userName: entity.user_name,
      isReply: entity.is_reply === 1,
    };
  }

  public static async getByRestaurantId(
    id: number | string
  ): Promise<IComment[]> {
    id = parseId(id);

    const reviewQuery = Query.select(
      "id",
      "content",
      "rating",
      "restaurant_id AS parent_id",
      "date",
      "user_id",
      "FALSE AS is_reply"
    )
      .from(this.ReviewTableName)
      .where("restaurant_id", SqlOperators.EQUAL);
    const replyQuery = Query.select(
      "id",
      "content",
      "NULL",
      "review_id",
      "date",
      "user_id",
      "TRUE"
    )
      .from(this.ReplyTableName)
      .where(
        "review_id",
        SqlOperators.IN,
        Query.select("id")
          .from(this.ReviewTableName)
          .where("restaurant_id", SqlOperators.EQUAL)
      );

    // Union the two queries and return the result
    return await Query.union(
      UnionType.UNION_ALL,
      reviewQuery,
      replyQuery
    ).toCommentArray([id, id]);
  }

  public static async getByUserId(id: number | string): Promise<IComment[]> {
    id = parseId(id);

    const reviewQuery = Query.select(
      "id",
      "content",
      "rating",
      "restaurant_id AS parent_id",
      "date",
      "user_id",
      "FALSE AS is_reply"
    )
      .from(this.ReviewTableName)
      .where("user_id", SqlOperators.EQUAL);
    const replyQuery = Query.select(
      "id",
      "content",
      "NULL",
      "review_id",
      "date",
      "user_id",
      "TRUE"
    )
      .from(this.ReplyTableName)
      .where("user_id", SqlOperators.EQUAL);

    // Union the two queries and return the result
    return await Query.union(
      UnionType.UNION_ALL,
      reviewQuery,
      replyQuery
    ).toCommentArray([id, id]);
  }

  public static async addOne(comment: any): Promise<boolean> {
    const data = handleZodParse(newCommentRequest, comment);
    if (data.review_id === undefined) {
      return await this.addOneReview(data);
    } else {
      return await this.addOneReply(data);
    }
  }

  private static async addOneReview(
    review: z.infer<typeof newCommentRequest> & { restaurant_id: number }
  ): Promise<boolean> {
    // Check if restaurant exists and if user has already reviewed it
    const restaurantCheck = Query.select(
      "EXISTS " +
        Query.select()
          .from(RestaurantController.tableName)
          .where("id", SqlOperators.EQUAL)
          .as("restaurantExists")
          .toString()! +
        ") AS a"
    );
    const reviewedCheck = Query.exists(
      Query.select()
        .from(this.ReviewTableName)
        .where("restaurant_id", SqlOperators.EQUAL)
        .and("user_id", SqlOperators.EQUAL)
        .as("userReviewed")
    ).as("b");

    const query = Query.select().from(
      "(" +
        restaurantCheck.join(
          JoinType.JOIN,
          reviewedCheck,
          "1",
          SqlOperators.EQUAL,
          "1"
        )
    );

    const { restaurantExists, userReviewed } = (await query
      .toArray([review.restaurant_id, review.restaurant_id, review.user_id])
      .then((res) => res[0])) as any;

    if (restaurantExists === 0)
      throw error(
        HttpStatusCodes.NOT_FOUND,
        "Parent restaurant does not exist."
      );
    if (userReviewed === 1)
      throw error(
        HttpStatusCodes.BAD_REQUEST,
        "You have already rated or reviewed this restaurant."
      );

    // Add review
    const result = await Query.insert(this.ReviewTableName, review).execute();
    return (result as any).affectedRows === 1;
  }

  private static async addOneReply(
    reply: z.infer<typeof newCommentRequest> & { review_id: number }
  ): Promise<boolean> {
    // Check if review exists and has content
    const query = Query.exists(
      Query.select()
        .from(this.ReviewTableName)
        .where("id", SqlOperators.EQUAL)
        .and("content", SqlOperators.IS_NOT, "NULL")
        .as("reviewExists")
    );

    const { reviewExists } = (await query
      .toArray([reply.review_id])
      .then((res) => res[0])) as any;

    if (reviewExists === 0)
      throw error(
        HttpStatusCodes.NOT_FOUND,
        "Parent review does not exist or is empty."
      );

    // Add reply
    const result = await Query.insert(this.ReplyTableName, reply).execute();
    return (result as any).affectedRows === 1;
  }

  public static async deleteOne(id: number | string): Promise<boolean> {
    id = parseId(id);

    const result = await Query.delete()
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .execute([id]);

    return (result as any).affectedRows === 1;
  }
}

import HttpStatusCodes from "$lib/httpStatusCodes";
import {
  parseId,
  RestaurantController,
  UserController,
  handleZodParse,
} from ".";
import Query, { SqlOperators, JoinType, UnionType } from "$lib/server/db-query";
import type { IComment } from "$lib/entities";

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
      .transform((s) => (s === "" ? undefined : s))
      .or(z.null().transform(() => undefined)),
    rating: z.number().int().min(0).max(5).optional(),
    userId: z.number().int(),
    parentId: z.number().int(),
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
          restaurant_id: undefined as number | undefined,
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
      .transform((s) => (s === "" ? null : s)),
    rating: z.number().int().min(0).max(5).optional(),
  })
  .refine((data) => data.rating !== undefined || data.content !== undefined, {
    message: "Must provide at least one field to update.",
    path: [],
  });

export default class CommentController {
  public static readonly tableName = "comments";

  static {
    Query.prototype.toCommentArray = async function (
      this: Query,
      data?: any[] | undefined
    ) {
      const comments = await Query.select("c.*", "username")
        .from(this.as("c"))
        .join(
          JoinType.INNER_JOIN,
          Query.select("id", "`name` AS username")
            .from(UserController.tableName)
            .as("u"),
          "c.user_id",
          SqlOperators.EQUAL,
          "u.id"
        )
        .toArray(data);
      return comments.map(CommentController.entityToComment);
    };

    Array.prototype.groupComments = function () {
      // Sort by latest first
      this.sort((a, b) => b.date.valueOf() - a.date.valueOf());

      const reviews = this.filter((c) => !c.isReply && c.content !== undefined);
      // Sort replies by parent id to easily split them
      // (Satble sort is guarenteed on ECMAScript 2019 and above)
      const replies = this.filter((c) => c.isReply)
        .reverse() // Reverse so that replies are by earliest first
        .sort((a, b) => a.reviewId! - b.reviewId!);

      // Get array of indices where parent id changes
      const splits = replies.reduce((acc, reply, i) => {
        if (replies[i - 1]?.reviewId !== reply.reviewId) acc.push(i);
        return acc;
      }, [] as number[]);
      splits.push(replies.length);

      // Group replies with their parent review
      let j = 0;
      return reviews.map((review) => {
        return {
          review,
          replies:
            replies[splits[j]]?.reviewId === review.id
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
      date: new Date(entity.date),
      userId: entity.user_id,
      userName: entity.username,
      restaurantId: entity.restaurant_id,
      reviewId: entity.review_id ?? undefined,
      isReply: entity.review_id !== undefined && entity.review_id !== null,
    };
  }

  public static async getOne(
    id: number | string,
    fields?: string[]
  ): Promise<IComment> {
    id = parseId(id);

    return await Query.select(...(fields ?? "*"))
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .toCommentArray([id])
      .then((comments) => comments[0]);
  }

  public static async getByRestaurantId(
    id: number | string
  ): Promise<IComment[]> {
    id = parseId(id);

    return await Query.select()
      .from(this.tableName)
      .where("restaurant_id", SqlOperators.EQUAL)
      .toCommentArray([id]);
  }

  public static async getByUserId(id: number | string): Promise<IComment[]> {
    id = parseId(id);

    return await Query.select()
      .from(this.tableName)
      .where("user_id", SqlOperators.EQUAL)
      .toCommentArray([id]);
  }

  public static async addOne(comment: any): Promise<boolean> {
    const data = handleZodParse(newCommentRequest, comment);
    return data.review_id === undefined
      ? await this.addOneReview(data)
      : await this.addOneReply(data);
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
        .from(this.tableName)
        .where("review_id", SqlOperators.IS, null)
        .and("user_id", SqlOperators.EQUAL)
        .and("restaurant_id", SqlOperators.EQUAL)
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

    const { restaurantExists, userReviewed } = await query
      .toArray([review.restaurant_id, review.user_id, review.restaurant_id])
      .then((res) => res[0]);

    if (restaurantExists === 0)
      throw error(HttpStatusCodes.NOT_FOUND, "Restaurant does not exist.");
    if (userReviewed === 1)
      throw error(
        HttpStatusCodes.BAD_REQUEST,
        "You have already rated or reviewed this restaurant."
      );

    // Add review
    const result = await Query.insert(this.tableName, review).execute();
    return (result as any).affectedRows === 1;
  }

  private static async addOneReply(
    reply: z.infer<typeof newCommentRequest> & { review_id: number }
  ): Promise<boolean> {
    // Get restaurant id from parent review
    const query = Query.select("restaurant_id")
      .from(this.tableName)
      .where("content", SqlOperators.IS_NOT, null)
      .and("review_id", SqlOperators.IS, null)
      .and("id", SqlOperators.EQUAL);

    const restaurantId = (await query
      .toArray([reply.review_id])
      .then((res) => res[0]?.restaurant_id)) as number | undefined;

    if (restaurantId === undefined)
      throw error(
        HttpStatusCodes.NOT_FOUND,
        "Parent review does not exist or is empty."
      );

    // Add reply
    reply.restaurant_id = restaurantId;
    const result = await Query.insert(this.tableName, reply).execute();
    return (result as any).affectedRows === 1;
  }

  public static async updateOne(
    id: number | string,
    comment: any
  ): Promise<boolean> {
    id = parseId(id);

    const data = handleZodParse(updateCommentRequest, comment);

    // Check if comment has content and if it is a reply
    const query = Query.select(
      "content IS NOT NULL AS hasContent",
      "review_id IS NOT NULL AS isReply"
    )
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL);

    const { hasContent, isReply } = await query
      .toArray([id])
      .then((res) => res[0]);

    if (hasContent === undefined || isReply === undefined)
      throw error(HttpStatusCodes.NOT_FOUND, "Comment does not exist.");
    if (hasContent === 1 && data.content === null)
      throw error(
        HttpStatusCodes.BAD_REQUEST,
        "Comment that already has content cannot be empty."
      );
    if (isReply === 1 && data.rating !== undefined)
      throw error(HttpStatusCodes.BAD_REQUEST, "Replies cannot have ratings.");

    const result = await Query.update(this.tableName)
      .set(data)
      .where("id", SqlOperators.EQUAL, id)
      .execute();

    return (result as any).affectedRows === 1;
  }

  public static async deleteOne(id: number | string): Promise<boolean> {
    id = parseId(id);

    const result = await Query.delete()
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .execute([id]);

    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0)
      throw error(HttpStatusCodes.NOT_FOUND, "Comment does not exist.");

    return affectedRows === 1;
  }
}

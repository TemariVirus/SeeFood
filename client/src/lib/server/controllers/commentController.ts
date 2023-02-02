import { idExists, RestaurantController, UserController } from ".";
import Query, {
  SqlOperators,
  JoinType,
  UnionType,
} from "$lib/server/db-query";
import type { IComment } from "$lib/server/entities";

declare module "$lib/server/db-query/query" {
  interface Query<T> {
    toCommentArray(): Promise<IComment[]>;
  }
}

declare global {
  interface Array<T> {
    groupComments(
      this: IComment[]
    ): { review: IComment; replies: IComment[] }[];
  }
}

export default class CommentController {
  public static readonly ReviewTableName = "reviews";
  public static readonly ReplyTableName = "replies";

  static {
    Query.prototype.toCommentArray = async function (this: Query<any>) {
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
        .toArray();
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

  // Get all comments for a restaurant with the given id
  public static async getByRestaurantId(idString: any): Promise<IComment[]> {
    const id = await idExists(idString, RestaurantController.tableName);

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
      .where("restaurant_id", SqlOperators.EQUAL, id);
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
          .where("restaurant_id", SqlOperators.EQUAL, id)
      );

    // Union the two queries and return the result
    return await Query.union(
      UnionType.UNION_ALL,
      reviewQuery,
      replyQuery
    ).toCommentArray();
  }

  public static async getByUserId(idString: any): Promise<IComment[]> {
    const id = await idExists(idString, UserController.tableName);

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
      .where("user_id", SqlOperators.EQUAL, id);
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
      .where("user_id", SqlOperators.EQUAL, id);

    // Union the two queries and return the result
    return await Query.union(
      UnionType.UNION_ALL,
      reviewQuery,
      replyQuery
    ).toCommentArray();
  }
}

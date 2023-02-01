import Query, {
  checkIdExists,
  SqlOperators,
  JoinType,
  UnionType,
} from "$lib/server/db-query";
import type { IComment } from "$lib/server/entities";
import { RestaurantController, UserController } from "$lib/server/controllers";

declare module "$lib/server/db-query/query" {
  interface Query<T> {
    toCommentArray(): Promise<IComment[]>;
  }
}

declare global {
  interface Array<T> {
    sortCommentsByDate(
      this: IComment[]
    ): { review: IComment; replies: IComment[] }[];
  }
}

export default class CommentController {
  public static readonly ReviewTableName = "reviews";
  public static readonly ReplyTableName = "replies";

  static {
    Query.prototype.toCommentArray = async function (this: Query<any>) {
      const comments = await Query.select("r.*", "username")
        .from(this.as("r"))
        .join(
          JoinType.INNER_JOIN,
          Query.select("id", "`name` AS username")
            .from(UserController.tableName)
            .as("u"),
          "r.user_id",
          SqlOperators.EQUAL,
          "u.id"
        )
        .toArray();

      return (comments as any[]).map((c) => {
        return {
          ...c,
          content: (c.content ??= undefined),
          rating: (c.rating ??= undefined),
          date: c.date.getTime(),
          is_reply: c.is_reply === 1,
        };
      });
    };

    Array.prototype.sortCommentsByDate = function () {
      // Sort by date ascending
      this.sort((a, b) => a.date.valueOf() - b.date.valueOf());

      const reviews = this.filter((c) => !c.is_reply);
      const replies = this.filter((c) => c.is_reply).reverse();

      // Group replies with their parent review
      let comments = reviews;
      replies.forEach((reply) => {
        const index = comments.findIndex((c) => c.id === reply.parent_id);
        if (index !== -1) comments.splice(index + 1, 0, reply);
      });

      return comments;
    };
  }

  // Get all comments for a restaurant with the given id
  public static async getByRestaurantId(idString: any): Promise<IComment[]> {
    const id = checkIdExists(idString, RestaurantController.tableName);

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
}

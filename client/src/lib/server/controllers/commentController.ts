import { type IApiResult, HttpStatusCodes } from "$lib/server";
import type { IComment } from "$lib/server/entities";

export default class CommentController {
    public static readonly ReviewTableName = "reviews";
    public static readonly ReplyTableName = "replies";

    public static async getByRestaurantId(id: number): Promise<IApiResult<IComment[]>> {
        checkIdExists(
            req.params.id?.toString(),
            res,
            Entities.Restaurant,
            async (id) => {
                const reviewQuery = Query.select(
                    "id",
                    "content",
                    "rating",
                    "restaurant_id AS parent_id",
                    "date",
                    "user_id",
                    "FALSE AS is_reply"
                )
                    .from(Entities.Review)
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
                    .from(Entities.Reply)
                    .where(
                        "review_id",
                        SqlOperators.IN,
                        Query.select("id")
                            .from(Entities.Review)
                            .where("restaurant_id", SqlOperators.EQUAL, id)
                    );
                // Union the two queries and return the result
                return res
                    .status(HttpStatusCodes.OK)
                    .json(
                        await Query.union(
                            UnionType.UNION_ALL,
                            reviewQuery,
                            replyQuery
                        ).toCommentArray()
                    );
            }
        )
    }
}
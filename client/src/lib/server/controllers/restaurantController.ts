import Query, {
  checkIdExists,
  JoinType,
  SqlOperators,
} from "$lib/server/db-query";
import {
  CategoryController,
  RestaurantCategoryController,
  CommentController,
} from ".";
import type { IRestaurant } from "$lib/server/entities";

declare module "$lib/server/db-query/query" {
  interface Query<T> {
    toRestaurantArray(): Promise<IRestaurant[]>;
  }
}

export default class RestaurantController {
  public static readonly tableName = "restaurants";

  static {
    Query.prototype.toRestaurantArray = async function (
      this: Query<any>
    ): Promise<IRestaurant[]> {
      const restaurants = await this.toArray();
      return (restaurants as any[]).map((r: any) => {
        return {
          ...r,
          categories: r.categories ? r.categories.split(",") : [],
          reviewCount: r.reviewCount ?? 0,
          restaurant_id: undefined,
        };
      });
    };
  }

  private static selectQueryWithCategories() {
    return Query.select()
      .from(this.tableName)
      .join(
        JoinType.LEFT_JOIN,
        Query.select("restaurant_id", "GROUP_CONCAT(name) AS categories")
          .from(RestaurantCategoryController.tableName)
          .join(
            JoinType.LEFT_JOIN,
            CategoryController.tableName,
            "category_id",
            SqlOperators.EQUAL,
            "id"
          )
          .groupBy("restaurant_id")
          .as("rc"),
        `${this.tableName}.id`,
        SqlOperators.EQUAL,
        "rc.restaurant_id"
      )
      .join(
        JoinType.LEFT_JOIN,
        Query.select(
          "restaurant_id",
          "AVG(rating) as rating",
          "COUNT(rating) as reviewCount"
        )
          .from(CommentController.ReviewTableName)
          .groupBy("restaurant_id")
          .as("r"),
        `${this.tableName}.id`,
        SqlOperators.EQUAL,
        "r.restaurant_id"
      );
  }

  public static async getAll(): Promise<IRestaurant[]> {
    return await this.selectQueryWithCategories().toRestaurantArray();
  }

  public static async getOne(idString: any): Promise<IRestaurant> {
    const id = await checkIdExists(idString, this.tableName);
    return await this.selectQueryWithCategories()
      .where(`${this.tableName}.id`, SqlOperators.EQUAL, id)
      .toRestaurantArray()
      .then((restaurants) => (restaurants as IRestaurant[])[0]);
  }
}

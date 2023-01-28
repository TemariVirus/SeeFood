import Entity, { Category, RestaurantCategory, Review } from ".";
import { Query, JoinType, SqlOperators } from "../db-query/query";

declare module "../db-query/query" {
  interface Query<T> {
    toRestaurantArray(): Promise<T[]>;
  }
}

export class Restaurant implements Entity {
  static readonly tableName = "restaurants";
  static readonly autoIncColumns: (keyof Restaurant)[] = ["id"];
  static readonly requiredColumns: (keyof Restaurant)[] = [
    "description",
    "logo_url",
    "name",
    "main_img_url",
  ];

  id: number;
  description: string;
  logo_url: string;
  name: string;
  main_img_url: string;
  opening_hours?: string;
  telephone_no?: string;
  website?: string;

  static {
    Query.prototype.toRestaurantArray = function (this: Query<any>) {
      return this.toArray().then((restaurants) =>
        (restaurants as any[]).map((r) => {
          return {
            ...r,
            categories: r.categories ? r.categories.split(",") : [],
            reviewCount: r.reviewCount ?? 0,
            restaurant_id: undefined,
          };
        })
      );
    };
  }

  // Returns a query that selects all restaurants and joins them with their categories
  static selectQueryWithCategories() {
    return Query.select()
      .from(Restaurant)
      .join(
        JoinType.LEFT_JOIN,
        Query.select("restaurant_id", "GROUP_CONCAT(name) AS categories")
          .from(RestaurantCategory)
          .join(
            JoinType.LEFT_JOIN,
            Category,
            "category_id",
            SqlOperators.EQUAL,
            "id"
          )
          .groupBy("restaurant_id")
          .as("rc"),
        `${Restaurant.tableName}.id`,
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
          .from(Review)
          .groupBy("restaurant_id")
          .as("r"),
        `${Restaurant.tableName}.id`,
        SqlOperators.EQUAL,
        "r.restaurant_id"
      );
  }
}

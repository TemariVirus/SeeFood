import {
  parseId,
  CategoryController,
  RestaurantCategoryController,
  CommentController,
} from ".";
import Query, { JoinType, SqlOperators } from "$lib/server/db-query";
import type { IRestaurant } from "$lib/server/entities";

export default class RestaurantController {
  public static readonly tableName = "restaurants";

  private static selectQueryTemplate() {
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

  private static entityToRestaurant(entity: any): IRestaurant {
    return {
      id: entity.id,
      description: entity.description,
      logoUrl: entity.logo_url,
      name: entity.name,
      mainImgUrl: entity.main_img_url,
      openingHours: entity.opening_hours ?? undefined,
      telephoneNo: entity.telephone_no ?? undefined,
      website: entity.website ?? undefined,
      categories: (entity.categories ?? "").split(",").filter((c: string) => c),
      rating: entity.rating,
      reviewCount: entity.reviewCount ?? 0,
    };
  }

  public static async getAll(likeName: string = ""): Promise<IRestaurant[]> {
    const query = this.selectQueryTemplate().where(
      "`name`",
      SqlOperators.LIKE,
      `%${likeName}%`
    );

    return await query
      .toArray()
      .then((restaurants) => restaurants.map(this.entityToRestaurant));
  }

  public static async getOne(id: number | string): Promise<IRestaurant> {
    id = parseId(id);

    return await this.selectQueryTemplate()
      .where("id", SqlOperators.EQUAL)
      .toArray([id])
      .then((restaurants) => this.entityToRestaurant(restaurants[0]));
  }

  public static async getByCategoryId(
    id: number | string,
    likeName: string = ""
  ): Promise<IRestaurant[]> {
    id = parseId(id);
    const query = this.selectQueryTemplate()
      .where(
        "rc.restaurant_id",
        SqlOperators.IN,
        Query.select("restaurant_id")
          .from(RestaurantCategoryController.tableName)
          .where("category_id", SqlOperators.EQUAL)
      )
      .and("`name`", SqlOperators.LIKE, `%${likeName}%`);

    return await query
      .toArray([id])
      .then((restaurants) => restaurants.map(this.entityToRestaurant));
  }
}

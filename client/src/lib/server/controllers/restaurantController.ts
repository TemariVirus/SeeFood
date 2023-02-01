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

  public static async getAll(): Promise<IRestaurant[]> {
    return await this.selectQueryTemplate()
      .toArray()
      .then(restaurants => restaurants.map(this.entityToRestaurant));
  }

  public static async getOne(idString: any): Promise<IRestaurant> {
    const id = await checkIdExists(idString, this.tableName);
    return await this.selectQueryTemplate()
      .where(`${this.tableName}.id`, SqlOperators.EQUAL, id)
      .toArray()
      .then(restaurants => this.entityToRestaurant(restaurants[0]));
  }
}

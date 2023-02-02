import { idExists } from ".";
import Query, { SqlOperators } from "$lib/server/db-query";
import type { ICategory } from "$lib/server/entities";

export default class CategoryController {
  public static readonly tableName = "categories";

  private static entityToCategory(entity: any): ICategory {
    return {
      id: entity.id,
      name: entity.name,
      imgUrl: entity.img_url,
    };
  }

  public static async getAll(): Promise<ICategory[]> {
    return await Query.select()
      .from(this.tableName)
      .toArray()
      .then((categories) => categories.map(this.entityToCategory));
  }

  public static async getOne(idString: string): Promise<ICategory> {
    const id = await idExists(idString, this.tableName);

    return await Query.select()
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL, id)
      .toArray()
      .then((categories) => this.entityToCategory(categories[0]));
  }
}

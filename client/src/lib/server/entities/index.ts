import type { ICategory } from "./icategory";
import type { IRestaurant } from "./irestaurant";
import type { IRestaurantCategory } from "./irestaurantCategory";
import type { IComment } from "./icomment";
import type { IUser } from "./iuser";

export default abstract class Entity {
  static readonly tableName: string;
  static readonly autoIncColumns: string[];
  static readonly requiredColumns: string[];
}

export { ICategory, IRestaurant, IRestaurantCategory, IUser, IComment };

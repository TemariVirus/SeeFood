import { Category } from "./category";
import { Restaurant } from "./restaurant";
import { RestaurantCategory } from "./restaurantCategory";
import { Review, Reply, Comment } from "./comment";
import { User } from "./user";

export default abstract class Entity {
  static readonly tableName: string;
  static readonly autoIncColumns: string[];
  static readonly requiredColumns: string[];
}

export {
  Category,
  Restaurant,
  RestaurantCategory,
  User,
  Review,
  Reply,
  Comment,
};

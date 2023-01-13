import { Category } from "./category";
import { Restaurant } from "./restaurant";
import { RestaurantCategory } from "./restaurantCategory";
import { Review } from "./review";
import { Reply } from "./reply";
import { User } from "./user";

export default abstract class Entity {
    static readonly tableName: string;
    static readonly autoIncColumns: string[];
    static readonly requiredColumns: string[];
}

export { Category, Restaurant, RestaurantCategory, User, Review, Reply };
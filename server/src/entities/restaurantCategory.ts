import Entity from ".";

export class RestaurantCategory implements Entity {
  static readonly tableName = "restaurant_categories";
  static readonly autoIncColumns: (keyof RestaurantCategory)[] = [];
  static readonly requiredColumns: (keyof RestaurantCategory)[] = [
    "restaurant_id",
    "category_id",
  ];

  restaurant_id: number;
  category_id: number;
}

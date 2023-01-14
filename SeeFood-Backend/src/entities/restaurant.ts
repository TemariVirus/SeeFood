import Entity, { Category, RestaurantCategory } from '.';
import { Query, JoinType, Operators } from '../query';

declare module '../query' {
    interface Query<T> {
        toRestaurantArray(): Promise<T[]>;
    }
}

export class Restaurant implements Entity {
    static readonly tableName = "restaurants";
    static readonly autoIncColumns: (keyof Restaurant)[] = ["id"];
    static readonly requiredColumns: (keyof Restaurant)[] = ["description", "logo_url", "name", "main_img_url"];

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
            return this
                .toArray()
                .then((restaurants) => (restaurants as any[]).map(r => {
                    return {
                        ...r,
                        categories: r.categories.split(","),
                    };
                }))
        }
    }

    static getQuery() {
        return Query.select()
            .from(Restaurant)
            .join(JoinType.JOIN,
                Query.select("restaurant_id AS id", "GROUP_CONCAT(name) AS categories")
                    .from(RestaurantCategory)
                    .join(JoinType.LEFT_JOIN, Category, "category_id", Operators.EQUAL, "id")
                    .groupBy("restaurant_id")
                    .as("rc"),
                `${Restaurant.tableName}.id`,
                Operators.EQUAL,
                "rc.id");
    }
}

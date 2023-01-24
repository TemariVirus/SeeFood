import Entity from ".";

export class Category implements Entity {
    static readonly tableName = "categories";
    static readonly autoIncColumns: (keyof Category)[] = ["id"];
    static readonly requiredColumns: (keyof Category)[] = [];

    id: number;
    name: string;
}

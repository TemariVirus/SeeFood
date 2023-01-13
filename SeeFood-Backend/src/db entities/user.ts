import Entity from ".";

export class User implements Entity {
    static readonly tableName = "users";
    static readonly autoIncColumns: (keyof User)[] = ["id"];
    static readonly requiredColumns: (keyof User)[] = ["name", "password", "salt"];

    id: number;
    name: string;
    password: string;
    salt: string;
}
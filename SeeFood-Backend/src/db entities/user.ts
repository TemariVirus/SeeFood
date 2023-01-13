import Entity from ".";
import { hashSync, compareSync } from 'bcrypt';

export class User implements Entity {
    static readonly tableName = "users";
    static readonly autoIncColumns: (keyof User)[] = ["id"];
    static readonly requiredColumns: (keyof User)[] = ["name", "password"];

    static get rounds() { return 10; }
    id: number;
    name: string;
    password: string;

    public setPassword(password: string) {
        this.password = hashSync(password, User.rounds);
    }

    public checkPassword(password: string) {
        return compareSync(password, this.password);
    }
}
import Entity from ".";
import { hashSync, compareSync } from 'bcrypt';
import { z } from "zod";

const newUserRequest = z.object({
    name: z.string(),
    password: z.string()
});

export class User implements Entity {
    static readonly tableName = "users";
    static readonly autoIncColumns: (keyof User)[] = ["id"];
    static readonly requiredColumns: (keyof User)[] = ["name", "password"];

    static get rounds() { return 10; }
    id: number;
    name: string;
    password: string;

    static fromJson(json: z.infer<typeof newUserRequest>) {
        const user = new User();
        user.name = json.name;
        user.setPassword(json.password);
        return user;
    }

    public setPassword(password: string) {
        this.password = hashSync(password, User.rounds);
    }

    public checkPassword(password: string) {
        return compareSync(password, this.password);
    }
}

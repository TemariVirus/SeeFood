import Entity from ".";
import { hashSync, compareSync } from 'bcrypt';
import { z } from "zod";

const newUserRequest = z.object({
    name: z.string(),
    password: z.string()
});

const updateUserRequest = z.object({
    name: z.string().optional(),
    password: z.string().optional()
}).refine(data => data.name || data.password, {
    message: "At least one field must be provided.",
    path: []
});

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

    static fromData(data: Partial<User>) {
        const user = new User();
        Object.assign(user, data);
        // Hash password if provided
        if (data.password)
            user.setPassword(data.password);
        return user;
    }

    static fromNewRequest(request: z.infer<typeof newUserRequest>) {
        const result = newUserRequest.safeParse(request);
        return result.success ? User.fromData(result.data) : null;
    }

    static fromUpdateRequest(request: z.infer<typeof updateUserRequest>) {
        const result = updateUserRequest.safeParse(request);
        return result.success ? User.fromData(result.data) : null;
    }
}

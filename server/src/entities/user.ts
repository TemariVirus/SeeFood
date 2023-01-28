import Entity from ".";
import { hashSync, compareSync } from "bcrypt";
import { z } from "zod";

const newUserRequest = z.object({
  name: z.string(),
  password: z.string(),
});

const updateUserRequest = z
  .object({
    name: z.string().optional(),
    password: z.string().optional(),
  })
  .refine((data) => data.name || data.password, {
    message: "At least one field must be provided.",
    path: [],
  });

export class User implements Entity {
  static readonly tableName = "users";
  static readonly autoIncColumns: (keyof User)[] = ["id"];
  static readonly requiredColumns: (keyof User)[] = ["name", "password"];

  static get rounds() {
    return 10;
  }
  id: number;
  name: string;
  password: string;
  salt: string;

  public setPassword(password: string) {
    const hash = hashSync(password, User.rounds);
    this.salt = hash.slice(7, 29);
    this.password = hash.slice(29);
  }

  public checkPassword(password: string) {
    return compareSync(
      password,
      `$2b$${User.rounds}$${this.salt}${this.password}`
    );
  }

  private static fromRequest(data: Partial<User>) {
    const user = new User();
    Object.assign(user, data);
    // Hash password if provided
    if (data.password) {
      user.setPassword(data.password);
    }
    return user;
  }

  static fromNewRequest(request: z.infer<typeof newUserRequest>) {
    let result = {} as { data: any; success: boolean };
    try {
      result.data = User.fromRequest(newUserRequest.parse(request));
      result.success = true;
    } catch (e) {
      result.data = e.issues;
      result.success = false;
    }
    return result;
  }

  static fromUpdateRequest(request: z.infer<typeof updateUserRequest>) {
    let result = {} as { data: any; success: boolean };
    try {
      result.data = User.fromRequest(updateUserRequest.parse(request));
      result.success = true;
    } catch (e) {
      result.data = e.issues;
      result.success = false;
    } finally {
      return result;
    }
  }
}

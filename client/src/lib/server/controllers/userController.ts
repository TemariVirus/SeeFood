import { HttpStatusCodes } from "$lib/server";
import { exists } from ".";
import Query, { SqlOperators } from "$lib/server/db-query";
import type { IUser } from "$lib/server/entities";
import { error } from "@sveltejs/kit";
import { hashSync, compareSync } from "bcrypt";
import { z } from "zod";

const addUserRequest = z.object({
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

const loginRequest = z.object({
  name: z.string(),
  password: z.string(),
});

export default class UserController {
  public static readonly tableName = "users";
  public static readonly defaultRounds = 10;

  private static parseAddRequest(request: z.infer<typeof addUserRequest>) {
    try {
      const data = addUserRequest.parse(request);
      data.password = hashSync(data.password, this.defaultRounds);
      return data;
    } catch (e: any) {
      throw error(HttpStatusCodes.BAD_REQUEST, e.issues);
    }
  }

  private static parseUpdateRequest(request: z.infer<typeof updateUserRequest>) {
    try {
      const data = updateUserRequest.parse(request);
      if (data.password) data.password = hashSync(data.password, this.defaultRounds);
      return data;
    } catch (e: any) {
      throw error(HttpStatusCodes.BAD_REQUEST, e.issues);
    }
  }

  public static async addOne(user: any): Promise<boolean> {
    const data = this.parseAddRequest(user);

    // Ensure name is unique
    if (await exists(this.tableName, { name: data.name }))
      throw error(HttpStatusCodes.CONFLICT, "Name is already taken.");

    // Create user
    const result = await Query.insert(this.tableName, data).execute();
    return (result as any).affectedRows === 1;
  }

  public static async checkAuth(request: z.infer<typeof loginRequest>): Promise<IUser> {
    try {
      const credentials = loginRequest.parse(request);

      // Get user in database
      const user = await Query.select()
        .from(this.tableName)
        .where("name", SqlOperators.EQUAL, credentials.name)
        .toArray()
        .then((users) => (users as any[])[0]) as IUser & { password: string };
      if (user === undefined)
        throw error(HttpStatusCodes.UNAUTHORIZED, "Incorrect username or password.");

      // Check if password is correct
      if (!compareSync(credentials.password, user.password))
        throw error(HttpStatusCodes.UNAUTHORIZED, "Incorrect username or password.");

      return {
        id: user.id,
        name: user.name,
      };
    } catch (e: any) {
      throw error(HttpStatusCodes.BAD_REQUEST, e.issues);
    }
  }
}

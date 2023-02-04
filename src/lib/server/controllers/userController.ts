import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { generateLoginToken } from "$lib/server/auth";
import { parseId, exists, handleZodParse } from ".";
import Query, { SqlOperators } from "$lib/server/db-query";
import type { IUser } from "$lib/entities";

import { hashSync, compareSync } from "bcrypt";
import { z } from "zod";

const defaultRounds = 10;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

const addUserRequest = z
  .object({
    name: z.string().trim().min(1, "Username cannot be empty."),
    password: z.string().regex(passwordRegex, {
      message:
        "Password must be at least 8 characters long, and must contain a lower case letter, \
upper case letter, decimal number, and non-alphanumeric character.",
    }),
  })
  .transform((data) => {
    data.password = hashSync(data.password, defaultRounds);
    return data;
  });

const updateUserRequest = z
  .object({
    name: z.string().trim().min(1, "Username cannot be empty.").optional(),
    password: z
      .string()
      .regex(passwordRegex, {
        message:
          "Password must be at least 8 characters long, and must contain a lower case letter, \
upper case letter, decimal number, and non-alphanumeric character.",
      })
      .optional(),
  })
  .refine((data) => data.name || data.password, {
    message: "At least one field must be provided.",
    path: [],
  })
  .transform((data) => {
    if (data.password) data.password = hashSync(data.password, defaultRounds);
    return data;
  });

const loginRequest = z.object({
  name: z.string().trim().min(1, "Username cannot be empty."),
  password: z.string().min(1, "Password cannot be empty."),
});

export default class UserController {
  public static readonly tableName = "users";
  public static readonly defaultRounds = 10;

  public static async addOne(user: any): Promise<boolean> {
    const data = handleZodParse(addUserRequest, user);

    // Ensure name is unique
    if (await exists(this.tableName, { name: data.name }))
      throw error(HttpStatusCodes.CONFLICT, "Name is already taken.");

    // Create user
    const result = await Query.insert(this.tableName, data).execute();
    return (result as any).affectedRows === 1;
  }

  public static async updateOne(
    id: number | string,
    user: any
  ): Promise<boolean> {
    id = parseId(id);
    const data = handleZodParse(updateUserRequest, user);

    // Ensure name is unique
    if (data.name !== undefined) {
      const nameExists = await Query.exists(
        Query.select()
          .from(this.tableName)
          .where("name", SqlOperators.EQUAL)
          .and("id", SqlOperators.NOT_EQUAL)
      )
        .execute([data.name, id])
        .then((exists) => (exists as any[])[0])
        .then((exists) => Object.values(exists)[0] === 1);
      if (data.name && nameExists)
        throw error(HttpStatusCodes.CONFLICT, "Name is already taken.");
    }

    // Update user
    const result = await Query.update(this.tableName)
      .set(data)
      .where("id", SqlOperators.EQUAL, id)
      .execute();
    return (result as any).affectedRows === 1;
  }

  public static async deleteOne(id: number): Promise<boolean> {
    const result = await Query.delete()
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .execute([id]);

    return (result as any).affectedRows === 1;
  }

  public static async getLoginToken(
    request: z.infer<typeof loginRequest>
  ): Promise<string> {
    let credentials;
    try {
      credentials = loginRequest.parse(request);
    } catch (e: any) {
      throw error(HttpStatusCodes.BAD_REQUEST, e.issues);
    }

    // Get user in database
    const user = (await Query.select("id", "password")
      .from(this.tableName)
      .where("name", SqlOperators.EQUAL)
      .toArray([credentials.name])
      .then((users) => (users as any[])[0])) as IUser & { password: string };

    if (user === undefined)
      throw error(
        HttpStatusCodes.UNAUTHORIZED,
        "Incorrect username or password."
      );

    // Check if password is correct
    if (!compareSync(credentials.password, user.password))
      throw error(
        HttpStatusCodes.UNAUTHORIZED,
        "Incorrect username or password."
      );

    return generateLoginToken(user.id);
  }
}

import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { lastTokenResets, generateLoginToken } from "$lib/server/tokens";
import { parseId, exists, handleZodParse } from ".";
import Query, { JoinType, SqlOperators } from "$lib/server/db-query";
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
  .transform((data) => ({
    name: data.name,
    password: hashSync(data.password, defaultRounds),
    last_token_reset: new Date(),
  }));

const updateUserRequest = z
  .object({
    name: z.string().trim().min(1, "Username cannot be empty.").optional(),
    oldPassword: z.string().optional(),
    password: z
      .string()
      .regex(passwordRegex, {
        message:
          "Password must be at least 8 characters long, and must contain a lower case letter, \
upper case letter, decimal number, and non-alphanumeric character.",
      })
      .optional(),
  })
  .refine((data) => Object.values(data).filter((v) => v).length > 0, {
    message: "At least one field must be provided.",
    path: [],
  })
  .refine((data) => !!(data.oldPassword || !data.password), {
    message: "Old password must be provided to change password.",
    path: ["oldPassword"],
  })
  .transform((data) => ({
    name: data.name,
    oldPassword: data.oldPassword,
    password: data.password
      ? hashSync(data.password, defaultRounds)
      : undefined,
    last_token_reset: data.password ? new Date() : undefined,
  }));

const loginRequest = z.object({
  name: z.string().trim().min(1, "Username cannot be empty."),
  password: z.string().min(1, "Password cannot be empty."),
});

interface IUserApiResponse {
  success: boolean;
  token?: string;
}

export default class UserController {
  public static readonly tableName = "users";
  public static readonly defaultRounds = 10;

  public static async getName(id: number | string): Promise<string> {
    id = parseId(id);
    const result = await Query.select("name")
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .toArray([id]);

    if (result.length === 0)
      throw error(HttpStatusCodes.NOT_FOUND, "User not found.");
    return result[0].name;
  }

  public static async addOne(user: any): Promise<IUserApiResponse> {
    const data = handleZodParse(addUserRequest, user);

    // Ensure name is unique
    if (await exists(this.tableName, { name: data.name }))
      throw error(HttpStatusCodes.CONFLICT, "Name is already taken.");

    // Create user
    const result = await Query.insert(this.tableName, data).execute();
    if ((result as any).affectedRows !== 1) return { success: false };

    const userId = (result as any).insertId;
    lastTokenResets.set(userId, data.last_token_reset);
    return {
      success: true,
      token: generateLoginToken(userId),
    };
  }

  public static async updateOne(
    id: number | string,
    user: any
  ): Promise<IUserApiResponse> {
    id = parseId(id);
    const data = handleZodParse(updateUserRequest, user);

    // Ensure name is unique and old password is correct
    if (data.name || data.password) {
      const check = await Query.select("`password`, nameExists")
        .from(this.tableName)
        .join(
          JoinType.JOIN,
          Query.exists(
            Query.select()
              .from(this.tableName)
              .where("name", SqlOperators.EQUAL)
              .and("id", SqlOperators.NOT_EQUAL)
              .as("nameExists")
          ).as("a"),
          "1",
          SqlOperators.EQUAL,
          "1"
        )
        .where("id", SqlOperators.EQUAL)
        .toArray([data.name, id, id])
        .then((result) => result[0]);

      if (!check) throw error(HttpStatusCodes.NOT_FOUND, "User not found.");
      if (check.nameExists)
        throw error(HttpStatusCodes.CONFLICT, "Name is already taken.");
      if (data.oldPassword && !compareSync(data.oldPassword, check.password))
        throw error(HttpStatusCodes.UNAUTHORIZED, "Incorrect password.");

      delete data.oldPassword;
    }

    // Update user
    const result = await Query.update(this.tableName)
      .set(data)
      .where("id", SqlOperators.EQUAL, id)
      .execute();
    if ((result as any).affectedRows !== 1) return { success: false };

    // No password change, return success
    if (data.password === undefined) return { success: true };

    lastTokenResets.set(id, data.last_token_reset!);
    return {
      success: true,
      token: generateLoginToken(id),
    };
  }

  public static async deleteOne(id: number): Promise<IUserApiResponse> {
    const result = await Query.delete()
      .from(this.tableName)
      .where("id", SqlOperators.EQUAL)
      .execute([id]);
    if ((result as any).affectedRows !== 1) {
      return { success: false };
    }

    lastTokenResets.delete(id);
    return { success: true };
  }

  public static async login(
    request: z.infer<typeof loginRequest>
  ): Promise<IUserApiResponse> {
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

    return {
      success: true,
      token: generateLoginToken(user.id),
    };
  }
}

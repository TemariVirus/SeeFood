import { error } from "@sveltejs/kit";
import { HttpStatusCodes } from "$lib/server";
import type { IUser } from "$lib/server/entities";
import { Query, SqlOperators, JoinType, UnionType } from "./query";
import { UserController } from "$lib/server/controllers";
import { compareSync } from "bcrypt";

// Check if an id is valid and exists in the specified table
export async function checkIdExists(idString: string, table: string) {
  // Ensure id is a number
  const id = Number.parseInt(idString);
  if (!Number.isSafeInteger(id))
    throw error(HttpStatusCodes.BAD_REQUEST, "Invalid id.");

  // Ensure entity exists
  if (!(await checkExists(table, { id: id })))
    throw error(HttpStatusCodes.NOT_FOUND, "Entity not found.");

  return id;
}

// Check if an entity with the specified properties exists in the table
export async function checkExists(
  table: string,
  properties: Record<string, any>
) {
  // Spilt properties into fields and values
  const fields = Object.keys(properties);
  const values = fields.map((field) => properties[field]);
  if (fields.length === 0)
    throw new Error("Must have at least one property to check.");

  // Create and execute query
  let innerQuery = Query.select()
    .from(table)
    .where(fields[0], SqlOperators.EQUAL);
  for (let i = 1; i < fields.length; i++)
    innerQuery = innerQuery.and(fields[i], SqlOperators.EQUAL);

  return await Query.exists(innerQuery)
    .execute(values)
    .then((result) => Object.values((result as any[])[0])[0] === 1);
}

// Check authorization header and return user
export async function checkAuth(req) {
  // Ensure authorization header is present and valid
  const authHeader = req.headers.authorization.split(" ");
  if (authHeader.length !== 2 || authHeader[0] !== "Basic")
    throw error(
      HttpStatusCodes.UNAUTHORIZED,
      "Ensure that you are using basic authentication."
    );
  const credentials = Buffer.from(authHeader[1], "base64")
    .toString()
    .split(":");
  if (credentials.length !== 2)
    throw error(
      HttpStatusCodes.BAD_REQUEST,
      "Credentials were formmatted incorrectly."
    );

  // Get user in database
  const user = {} as IUser & { password: string };
  Object.assign(
    user,
    await Query.select()
      .from(UserController.tableName)
      .where("name", SqlOperators.EQUAL, credentials[0])
      .limit(1)
      .toArray()
      .then((users) => (users as IUser[])[0])
  );

  // Check if user exists and password is correct
  if (!user.name || !compareSync(credentials[1], user.password))
    throw error(
      HttpStatusCodes.UNAUTHORIZED,
      "Incorrect username or password."
    );

  return {
    ...user,
    password: undefined,
  } as IUser;
}

export default Query;
export { SqlOperators, JoinType, UnionType };
import CategoryController from "./categoryController";
import CommentController from "./commentController";
import RestaurantCategoryController from "./restaurantCategoryController";
import RestaurantController from "./restaurantController";
import UserController from "./userController";

import { error } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import Query, { SqlOperators } from "$lib/server/db-query";
import type { z } from "zod";

export function parseId(idString: number | string) {
  const id =
    typeof idString === "number" ? idString : Number.parseInt(idString);
  if (!Number.isSafeInteger(id))
    throw error(HttpStatusCodes.BAD_REQUEST, "Invalid id.");

  return id;
}

// Check if an entity with the specified properties exists in the table
export async function exists(table: string, properties: Record<string, any>) {
  // Spilt properties into fields and values
  const fields = Object.keys(properties);
  const values = fields.map((field) => properties[field]);
  if (fields.length === 0)
    throw new Error("Must have at least one property to check.");

  // Create query
  let innerQuery = Query.select()
    .from(table)
    .where(fields[0], SqlOperators.EQUAL);
  // Add fields to match
  for (let i = 1; i < fields.length; i++)
    innerQuery = innerQuery.and(fields[i], SqlOperators.EQUAL);

  return await Query.exists(innerQuery)
    .execute(values)
    .then((result) => {
      result = (result as any[])[0];
      return Object.values(result)[0] === 1;
    });
}

export function handleZodParse<T extends z.ZodType<any, any, any>>(
  parser: T,
  request: any
): z.infer<typeof parser> {
  try {
    const data = parser.parse(request);
    // Remove undefined properties
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) delete data[key];
    });
    return data;
  } catch (e: any) {
    if (e.issues) {
      throw error(HttpStatusCodes.BAD_REQUEST, e.issues);
    }
    throw e;
  }
}

export {
  CategoryController,
  CommentController,
  RestaurantCategoryController,
  RestaurantController,
  UserController,
};

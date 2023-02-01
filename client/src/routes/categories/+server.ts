import { type RequestHandler, json } from "@sveltejs/kit";
import { CategoryController } from "$lib/server/controllers";

export const GET = (async () => {
  return json(await CategoryController.getAll());
}) satisfies RequestHandler;

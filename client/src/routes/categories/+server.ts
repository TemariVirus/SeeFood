import { type RequestHandler, json } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { CategoryController } from "$lib/server/controllers";

export const GET = (async () => {
  return json(await CategoryController.getAll(), { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

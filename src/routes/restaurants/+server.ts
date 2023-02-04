import { type RequestHandler, json } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { RestaurantController } from "$lib/server/controllers";

export const GET = (async ({ request, params, url }: any) => {
  const searchTerm = url.searchParams.get("search") ?? "";
  return json(await RestaurantController.getAll(searchTerm), {
    status: HttpStatusCodes.OK,
  });
}) satisfies RequestHandler;

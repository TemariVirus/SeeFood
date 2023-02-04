import { type RequestHandler, json } from "@sveltejs/kit";
import { RestaurantController } from "$lib/server/controllers";

export const GET = (async ({ request, params, url }: any) => {
  const searchTerm = url.searchParams.get("search") ?? "";

  return json(
    await RestaurantController.getByCategoryId(params.id, searchTerm)
  );
}) satisfies RequestHandler;

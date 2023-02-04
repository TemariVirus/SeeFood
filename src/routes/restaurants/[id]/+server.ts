import { type RequestHandler, json } from "@sveltejs/kit";
import { RestaurantController } from "$lib/server/controllers";

export const GET = (async ({ params }: any) => {
  return json(await RestaurantController.getOne(params.id));
}) satisfies RequestHandler;

import { type RequestHandler, json } from '@sveltejs/kit';
import { RestaurantController } from '$lib/server/controllers';
 
export const GET = (async () => {
  return json(await RestaurantController.getAll());
}) satisfies RequestHandler;
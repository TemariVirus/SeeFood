import { type RequestHandler, json } from '@sveltejs/kit';
import { RestaurantController } from '$lib/server/controllers';
 
export const GET = (() => {
  return json(RestaurantController.getAll());
}) satisfies RequestHandler;
import { restaurantGetUrl } from "$lib/urls";
import { RestaurantController } from "$lib/server/controllers";

export const prerender = false;

export const load = async () => {
  return {
    restaurants: await RestaurantController.getAll(),
  };
};

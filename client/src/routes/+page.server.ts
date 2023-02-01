import { RestaurantController } from "$lib/server/controllers";

export const prerender = 'auto';

export const load = async () => {
  return {
    restaurants: await RestaurantController.getAll(),
  };
};

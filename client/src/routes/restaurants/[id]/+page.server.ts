import { RestaurantController } from "$lib//server/controllers";

export const prerender = 'auto';

export const load = async ({ params }: any) => {
  return await RestaurantController.getOne(params.id);
};

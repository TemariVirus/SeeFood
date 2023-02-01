import { RestaurantController } from "$lib/server/controllers";

export const prerender = "auto";

export const load = async ({ request, params, url }: any) => {
  const searchTerm = url.searchParams.get("search") ?? "";
  return {
    restaurants: await RestaurantController.getAll(searchTerm),
  };
};

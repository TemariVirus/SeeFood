import {
  RestaurantController,
  CategoryController,
} from "$lib/server/controllers";

export const prerender = false;

export const load = async ({ request, params, url }: any) => {
  const searchTerm = url.searchParams.get("search") ?? "";

  return {
    category: await CategoryController.getOne(params.id),
    restaurants: await RestaurantController.getByCategoryId(
      params.id,
      searchTerm
    ),
  };
};

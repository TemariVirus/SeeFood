import { CategoryController } from "$lib/server/controllers";

export const prerender = "auto";

export const load = async () => {
  return {
    categories: await CategoryController.getAll(),
  };
};

import { restaurantGetUrl } from "$lib/urls";

export const prerender = true;

export const load = async ({ params }: any) => {
  return await fetch(restaurantGetUrl + params.id).then((res) => res.json());
};

import { restaurantGetUrl } from "$lib/urls";

export const prerender = false;

export const load = async () => {
  return {
    restaurants: await fetch(restaurantGetUrl).then((res) => res.json()),
  };
};

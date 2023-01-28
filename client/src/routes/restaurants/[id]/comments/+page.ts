import { restaurantGetUrl, restaurantCommentsGetUrl } from "$lib/urls";

export const prerender = true;

export const load = async ({ params }: any) => {
  return {
    restaurant: await fetch(restaurantGetUrl + params.id).then((res) =>
      res.json()
    ),
    comments: await fetch(restaurantCommentsGetUrl(params.id)).then((res) =>
      res.json()
    ),
  };
};

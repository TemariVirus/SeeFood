import { RestaurantController, CommentController } from "$lib/server/controllers";

export const prerender = 'auto';

export const load = async ({ params }: any) => {
  return {
    restaurant: await RestaurantController.getOne(params.id),
    comments: await CommentController.getByRestaurantId(params.id)
      .then((comments) => comments.groupComments())
      .then((comments) => comments.flatMap((c) => ([c.review, ...c.replies])))
  };
};

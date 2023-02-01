import { RestaurantController, CommentController } from "$lib/server/controllers";
import type { IComment } from "$lib/server/entities";

export const prerender = 'auto';

export const load = async ({ params }: any) => {
  return {
    restaurant: await RestaurantController.getOne(params.id),
    // comments: await fetch(commentsGetUrl(params.id))
    //   .then((comments: IComment[]) => {
    //     // Sort by date ascending
    //     comments.sort((a, b) => a.date.valueOf() - b.date.valueOf());

    //     const reviews = comments.filter((c) => !c.is_reply);
    //     const replies = comments.filter((c) => c.is_reply).reverse();

    //     // Group replies with their parent review
    //     comments = reviews;
    //     replies.forEach((reply) => {
    //       const index = comments.findIndex((c) => c.id === reply.parent_id);
    //       if (index !== -1) comments.splice(index + 1, 0, reply);
    //     });

    //     return comments;
    //   }),
  };
};

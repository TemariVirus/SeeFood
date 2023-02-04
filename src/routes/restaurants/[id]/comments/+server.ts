import { type RequestHandler, json } from "@sveltejs/kit";
import { CommentController } from "$lib/server/controllers";

export const GET = (async ({ params }: any) => {
  return json(
    (await CommentController.getByRestaurantId(params.id)).groupComments()
  );
}) satisfies RequestHandler;

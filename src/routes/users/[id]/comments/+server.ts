import { type RequestHandler, json } from "@sveltejs/kit";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { CommentController } from "$lib/server/controllers";

export const GET = (async ({ params }) => {
  const id = params.id;
  return json(await CommentController.getByUserId(id!), {
    status: HttpStatusCodes.OK,
  });
}) satisfies RequestHandler;

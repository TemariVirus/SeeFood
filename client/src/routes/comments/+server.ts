import { type RequestHandler, json, error } from "@sveltejs/kit";
import { CommentController } from "$lib/server/controllers";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { getTokenPayload } from "$lib/server/auth";

export const POST = (async ({ request, params, url }: any) => {
  const userId = getTokenPayload(request);

  const data = await request.json();
  data.userId = userId;

  const success = await CommentController.addOne(data);
  if (!success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to post comment."
    );

  return json("Success", { status: HttpStatusCodes.CREATED });
}) satisfies RequestHandler;

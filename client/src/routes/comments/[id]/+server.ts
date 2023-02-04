import { type RequestHandler, json, error } from "@sveltejs/kit";
import { CommentController } from "$lib/server/controllers";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { getTokenPayload } from "$lib/server/auth";

export const PUT = (async ({ request, params, url }: any) => {
  const userId = getTokenPayload(request);

  // Check that the user is the owner of the comment
  const comment = await CommentController.getOne(params.id, ["user_id"]);
  if (comment.userId !== userId)
    throw error(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this comment."
    );

  // Update the comment
  const data = await request.json();
  const success = await CommentController.updateOne(params.id, data);

  if (!success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update comment."
    );

  return json("Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

export const DELETE = (async ({ request, params, url }: any) => {
  const userId = getTokenPayload(request);

  // Check that the user is the owner of the comment
  const comment = await CommentController.getOne(params.id, ["user_id"]);
  if (comment === undefined)
    throw error(HttpStatusCodes.NOT_FOUND, "Comment does not exist.");
  if (comment.userId !== userId)
    throw error(
      HttpStatusCodes.FORBIDDEN,
      "You are not the owner of this comment."
    );

  // Delete the comment
  const success = await CommentController.deleteOne(params.id);

  if (!success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to delete comment."
    );

  return json("Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

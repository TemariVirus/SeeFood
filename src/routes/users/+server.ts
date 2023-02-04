import { type RequestHandler, json, error,  } from "@sveltejs/kit";
import { getTokenPayload } from "$lib/server/auth";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { UserController } from "$lib/server/controllers";

export const POST = (async ({ request, params, url }: any) => {
  const data = await request.json();
  const success = await UserController.addOne(data);

  if (!success)
    throw error(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to add user.");
    
  return json("Success", { status: HttpStatusCodes.CREATED });
}) satisfies RequestHandler;

export const PUT = (async ({ request, params, url }: any) => {
  const userId = getTokenPayload(request);

  const data = await request.json();
  const success = await UserController.updateOne(userId, data);

  if (!success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update user."
    );

  return json("Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

export const DELETE = (async ({ request, params, url }: any) => {
  const userId = getTokenPayload(request);

  const success = await UserController.deleteOne(userId);

  if (!success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to delete user."
    );

  return json("Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;
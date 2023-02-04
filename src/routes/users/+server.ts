import { type RequestHandler, json, error } from "@sveltejs/kit";
import { getLoginToken } from "$lib/server/tokens";
import HttpStatusCodes from "$lib/httpStatusCodes";
import { UserController } from "$lib/server/controllers";

export const GET = (async ({ request, params, url }: any) => {
  const token = getLoginToken(request);

  const name = await UserController.getName(token.userId);

  return json({ name }, { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

export const POST = (async ({ request, params, url }: any) => {
  const data = await request.json();
  const response = await UserController.addOne(data);

  if (!response.success)
    throw error(HttpStatusCodes.INTERNAL_SERVER_ERROR, "Failed to add user.");

  return json(response.token, { status: HttpStatusCodes.CREATED });
}) satisfies RequestHandler;

export const PUT = (async ({ request, params, url }: any) => {
  const token = getLoginToken(request);

  const data = await request.json();
  const response = await UserController.updateOne(token.userId, data);

  if (!response.success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to update user."
    );

  return json(response.token ?? "Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

export const DELETE = (async ({ request, params, url }: any) => {
  const token = getLoginToken(request);

  const response = await UserController.deleteOne(token.userId);

  if (!response.success)
    throw error(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to delete user."
    );

  return json("Success", { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

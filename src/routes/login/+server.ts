import { type RequestHandler, json } from "@sveltejs/kit";
import { UserController } from "$lib/server/controllers";
import HttpStatusCodes from "$lib/httpStatusCodes";

export const POST = (async ({ request, params, url }: any) => {
  const body = await request.json();
  const token = await UserController.getLoginToken(body);

  return json(token, { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

import { type RequestHandler, json } from "@sveltejs/kit";
import { UserController } from "$lib/server/controllers";
import HttpStatusCodes from "$lib/httpStatusCodes";

export const POST = (async ({ request, params, url }: any) => {
  const body = await request.json();
  const response = await UserController.login(body);

  if (!response.success) {
    return json("Failed to log in", { status: HttpStatusCodes.UNAUTHORIZED });
  }

  return json(response.token!, { status: HttpStatusCodes.OK });
}) satisfies RequestHandler;

import { type RequestHandler, json } from "@sveltejs/kit";

export const prerender = true;

export const GET = (() => {
  return json("pong");
}) satisfies RequestHandler;

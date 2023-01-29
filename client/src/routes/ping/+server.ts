import { text } from "@sveltejs/kit";

export const prerender = true;

export async function GET() {
  return text("pong");
}

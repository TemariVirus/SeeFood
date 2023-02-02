import { type RequestHandler, json } from '@sveltejs/kit';
import { UserController } from '$lib/server/controllers';

export const POST = (async ({ request, params, url }: any) => {
    const { username, password } = await request.json();
    console.log(username, password);
    return json("hi");
}) satisfies RequestHandler;
import { type RequestHandler, json, error } from '@sveltejs/kit';
import { UserController } from '$lib/server/controllers';
import { generateLoginToken } from '$lib/server';

export const POST = (async ({ request, params, url }: any) => {
    const body = await request.json();
    const user = await UserController.checkAuth(body);
    const token = generateLoginToken(user);

    return json({
        status: 200,
        body: {
            token
        },
    });
}) satisfies RequestHandler;

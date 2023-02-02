import { type RequestHandler, json, error } from '@sveltejs/kit';
import { UserController } from '$lib/server/controllers';

export const POST = (async ({ request, params, url }: any) => {
    const data = await request.json();
    const success = await UserController.addOne(data);
    if (!success) throw error(500, "Failed to add user.");
    return json("Success");
}) satisfies RequestHandler;

// export const PUT = (async ({ request, params, url }: any) => {
//     const data = await request.json();
//     const success = await UserController.updateOne(params.id, data);
//     if (!success) throw error(500, "Failed to update user.");
//     return json("Success");
// }) satisfies RequestHandler;
import { text } from '@sveltejs/kit';

export async function GET() {
    return text('pong');
}
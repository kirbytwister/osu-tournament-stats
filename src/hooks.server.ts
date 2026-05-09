import type { Handle } from "@sveltejs/kit";
import { getCookieSession } from "$lib/server/session";

export const handle: Handle = async ({ event, resolve }) => {
	const session = await getCookieSession(event);

	if (!session) {
		return await resolve(event);
	}

	event.locals.user = session;
	return await resolve(event);
};

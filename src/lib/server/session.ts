import type { RequestEvent } from "@sveltejs/kit";
import { COOKIE_NAME } from "$lib/constants";
import { type SessionPayload, validateSessionToken } from "$lib/utils/auth";

export const getCookieSession = async (event: RequestEvent): Promise<SessionPayload | null> => {
	const token = event.cookies.get(COOKIE_NAME);

	if (!token) {
		return null;
	}

	const session = await validateSessionToken(token);

	if (!session) {
		return null;
	}

	return session;
};

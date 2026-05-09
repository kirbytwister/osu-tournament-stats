import { error, redirect } from "@sveltejs/kit";
import { generateState } from "arctic";
import * as v from "valibot";
import { form, getRequestEvent } from "$app/server";
import { COOKIE_NAME } from "$lib/constants";
import { osuOAuth } from "$lib/server/oauth";
import { redis } from "$lib/server/redis";
import { invalidateSession } from "$lib/utils/auth";

export const auth = form(
	v.object({
		action: v.picklist(["login", "logout"]),
	}),
	async ({ action }) => {
		if (action === "login") {
			const state = generateState();

			const osuAuthUrl = osuOAuth.createAuthorizationURL(state, ["identify"]);

			await redis.setex(`state-${state}`, 300, 1);

			redirect(302, osuAuthUrl);
		} else {
			const { cookies } = getRequestEvent();

			const sessionCookie = cookies.get(COOKIE_NAME);

			if (!sessionCookie) {
				error(401, "Unauthorized");
			}

			await invalidateSession(sessionCookie);
			cookies.delete(COOKIE_NAME, {
				path: "/",
			});

			redirect(302, "/");
		}
	},
);

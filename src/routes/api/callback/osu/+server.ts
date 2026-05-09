import { error, type RequestEvent, redirect } from "@sveltejs/kit";
import { panic, Result } from "better-result";
import { DrizzleQueryError } from "drizzle-orm";
import { API } from "osu-api-v2-js";
import * as v from "valibot";
import { NODE_ENV, OSU_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_OSU_CLIENT_ID, PUBLIC_OSU_REDIRECT_URI } from "$env/static/public";
import { COOKIE_NAME } from "$lib/constants";
import { db } from "$lib/server/db/client.js";
import { Users } from "$lib/server/db/schema.js";
import { redis } from "$lib/server/redis.js";
import { createSession } from "$lib/utils/auth";

const osuCallbackSchema = v.object({
	code: v.string(),
	state: v.string(),
});

export const GET = async ({ url, cookies }: RequestEvent) => {
	const parse = v.safeParse(osuCallbackSchema, Object.fromEntries(url.searchParams));

	if (!parse.success) {
		redirect(302, "/");
	}

	const { code, state } = parse.output;
	const isValidState = await redis.get(`state-${state}`);

	if (!isValidState) {
		error(401, "Invalid state");
	}

	await redis.del(`state-${state}`);

	const client = new API(
		Number(PUBLIC_OSU_CLIENT_ID),
		OSU_CLIENT_SECRET,
		PUBLIC_OSU_REDIRECT_URI,
		code,
	);

	const { username, id, is_bot, is_deleted, is_restricted } = await client
		.getResourceOwner()
		.catch((e) => {
			console.error(e);
			error(401, "Failed to get resource owner");
		});

	if (is_bot || is_deleted || is_restricted) {
		error(401, "User is bot, deleted, or restricted");
	}

	const res = await Result.tryPromise({
		try: () =>
			db
				.insert(Users)
				.values({
					osuId: id,
					username,
				})
				.onConflictDoUpdate({
					target: [Users.osuId],
					set: {
						username,
					},
				})
				.returning({
					id: Users.id,
				}),
		catch: (e) => {
			if (e instanceof DrizzleQueryError) {
				throw panic(e.message, e.cause);
			}
			throw panic("Failed to create user");
		},
	});

	const [user] = res.unwrap();

	if (!user) {
		error(500, "Failed to create user");
	}

	const session = await createSession({
		id: user.id,
	});

	cookies.set(COOKIE_NAME, session.token, {
		path: "/",
		sameSite: "lax",
		secure: NODE_ENV === "production",
		maxAge: 60 * 60 * 24 * 30,
	});
	redirect(302, "/");
};

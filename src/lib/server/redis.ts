import { Redis } from "ioredis";
import { NODE_ENV, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from "$env/static/private";

export const redis = new Redis({
	host: REDIS_HOST,
	port: Number(REDIS_PORT),
	password: NODE_ENV === "development" ? REDIS_PASSWORD : undefined,
});

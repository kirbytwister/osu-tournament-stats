import crypto from "node:crypto";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { db } from "$lib/server/db/client";
import { type Session, Sessions, type User, Users } from "$lib/server/db/schema";

export type SessionWithToken = Session & { token: string };

export function generateSessionToken(): string {
	// Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion)
	const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";

	// Generate 24 bytes = 192 bits of entropy.
	// We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = "";
	for (let i = 0; i < bytes.length; i++) {
		// >> 3 "removes" the right-most 3 bits of the byte
		id += alphabet[bytes[i]! >> 3];
	}
	return id;
}

export async function createSession(user: Pick<User, "id">): Promise<SessionWithToken> {
	const now = new Date();

	const id = generateSessionToken();
	const secret = generateSessionToken();
	const secretHash = await hashSecret(secret);
	const session: Session = {
		id,
		userId: user.id,
		secretHash: Buffer.from(secretHash).toString("hex"),
		lastVerifiedAt: now,
		createdAt: now,
	};

	await db.insert(Sessions).values(session);

	return {
		...session,
		token: `${id}.${secret}`,
	};
}

export async function validateSessionToken(
	token: string | undefined,
): Promise<SessionValidationResult> {
	if (!token) return null;

	const [sessionId, sessionSecret] = token.split(".");
	if (!sessionId || !sessionSecret) return null;

	const databaseSession = await db
		.select({ user: Users, session: Sessions })
		.from(Sessions)
		.innerJoin(Users, eq(Sessions.userId, Users.id))
		.where(eq(Sessions.id, sessionId))
		.limit(1)
		.then((rows) => rows[0]);

	if (!databaseSession) {
		return null;
	}

	const { session, user } = databaseSession;

	const secretHash = new TextEncoder().encode(sessionSecret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretHash);
	const dbHash = new Uint8Array(Buffer.from(session.secretHash, "hex"));

	if (!constantTimeEqual(new Uint8Array(secretHashBuffer), dbHash)) {
		return null;
	}

	const now = dayjs();
	const lastVerifiedAt = dayjs(session.lastVerifiedAt);

	// Inactivity timeout: 30 days
	if (now.diff(lastVerifiedAt, "day") >= 30) {
		await db.delete(Sessions).where(eq(Sessions.id, sessionId));
		return null;
	}

	// Activity check interval: 1 hour
	if (now.diff(lastVerifiedAt, "hour") >= 1) {
		session.lastVerifiedAt = now.toDate();
		await db
			.update(Sessions)
			.set({ lastVerifiedAt: session.lastVerifiedAt })
			.where(eq(Sessions.id, sessionId));
	}

	return {
		session,
		user,
	};
}

export async function invalidateSession(token: string): Promise<void> {
	const [sessionId] = token.split(".");
	if (sessionId) {
		await db.delete(Sessions).where(eq(Sessions.id, sessionId));
	}
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest("SHA-256", secretBytes);
	return new Uint8Array(secretHashBuffer);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.byteLength !== b.byteLength) {
		return false;
	}
	let c = 0;
	for (let i = 0; i < a.byteLength; i++) {
		const aVal = a.at(i);
		const bVal = b.at(i);

		if (aVal && bVal) {
			c |= aVal ^ bVal;
		}
	}
	return c === 0;
}

export type SessionPayload = {
	session: Session;
	user: User;
};

export type SessionValidationResult = SessionPayload | null;

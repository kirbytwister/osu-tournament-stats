// See https://svelte.dev/docs/kit/types#app.d.ts

import type { SessionPayload } from "$lib/utils/auth";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: SessionPayload;
		}
		interface PageData {
			session: SessionPayload | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

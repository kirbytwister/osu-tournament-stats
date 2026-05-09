<script lang="ts">
import { Button } from "$lib/components/ui/button";
import type { PageData } from "./$types";
import { auth } from "./auth.remote";

let { data }: { data: PageData } = $props();
let loading = $state(false);
</script>

<div class="flex flex-col gap-3 justify-center items-center">
	<p>osu! Tournament Stats</p>
	<form
		{...auth.enhance(async ({ submit, data }) => {
			loading = data.action === 'login';
			await submit().catch(() => {
				loading = false;
			});
		})}
		class="flex flex-col gap-2">
		{#if data.session}
			Logged in as {data.session.user.username}
		{:else}
			<Button disabled={loading} {...auth.fields.action.as('submit', 'login')}> Login </Button>
		{/if}
	</form>
</div>

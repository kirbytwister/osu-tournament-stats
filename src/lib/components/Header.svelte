<script lang="ts">
import type { SessionPayload } from "$lib/utils/auth";
import { auth } from "../../routes/auth.remote";
import Icon from "./Icon.svelte";
import ModeSwitchButton from "./ModeSwitchButton.svelte";
import Avatar from "./ui/avatar/avatar.svelte";
import AvatarImage from "./ui/avatar/avatar-image.svelte";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

let { session }: { session: SessionPayload | null } = $props();
</script>

<header class="flex justify-between items-center p-2 px-4 box-border border-b-2">
	<a href="/">osu! Tournament Stats</a>
	<div class="flex gap-2 items-center">
		<ModeSwitchButton />
		{#if session}
			<Popover>
				<PopoverTrigger>
					<Avatar class="hover:scale-110 transition-all duration-100">
						<AvatarImage src={`https://a.ppy.sh/${session.user.osuId}`} />
					</Avatar>
				</PopoverTrigger>
				<PopoverContent align="end" class="w-40 p-2">
					<form {...auth.for('logout')}>
						<Button
							class="flex w-full justify-start"
							variant="ghost"
							{...auth.fields.action.as('submit', 'logout')}>
							<Icon icon="fa7-solid:sign-out" />
							Logout
						</Button>
					</form>
				</PopoverContent>
			</Popover>
		{/if}
	</div>
</header>

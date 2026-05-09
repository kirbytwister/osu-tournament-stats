<script lang="ts">
import "./layout.css";
import "iconify-icon";
import { ModeWatcher } from "mode-watcher";
import favicon from "$lib/assets/favicon.svg";
import Header from "$lib/components/Header.svelte";

let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon}>
	<title>osu! Tournament Stats</title>
</svelte:head>

<ModeWatcher />
<Header session={data.session} />
<div class="flex flex-col min-h-screen">
	{@render children()}
</div>

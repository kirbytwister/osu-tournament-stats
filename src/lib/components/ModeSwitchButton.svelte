<script lang="ts">
import { mode, toggleMode } from "mode-watcher";

import { Button } from "$lib/components/ui/button/index.js";
import Icon from "./Icon.svelte";
</script>

<Button class="flex items-center" onclick={toggleMode} variant="outline" size="icon">
	<Icon icon={mode.current === "dark" ? "fa7-solid:sun" : "fa7-solid:moon"}></Icon>
	<span class="sr-only">Toggle theme</span>
</Button>

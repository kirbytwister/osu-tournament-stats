<script lang="ts">
import "iconify-icon";

type RotationAngle = "90" | "180" | "270";
type FlipDirection = "horizontal" | "vertical" | "both";

type IconProps = {
	icon: string;
	height?: `${number}`;
	width?: `${number}`;
	rotate?: `${RotationAngle}deg`;
	flip?: FlipDirection;
};
let { icon, height, width, rotate, flip }: IconProps = $props();

let flipStyle = $derived(() => {
	if (!flip) return undefined;

	return flip === "both" ? "horizontal,vertical" : flip;
});
</script>

<iconify-icon {icon} {height} {width} flip={flipStyle} {rotate}></iconify-icon>

import { Osu } from "arctic";
import { OSU_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_OSU_CLIENT_ID, PUBLIC_OSU_REDIRECT_URI } from "$env/static/public";

export const osuOAuth = new Osu(PUBLIC_OSU_CLIENT_ID, OSU_CLIENT_SECRET, PUBLIC_OSU_REDIRECT_URI);

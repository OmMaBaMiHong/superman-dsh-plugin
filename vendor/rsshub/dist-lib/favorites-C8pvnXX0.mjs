import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as ehapi_default } from "./ehapi-KLS5HGgL.mjs";
//#region lib/routes/ehentai/favorites.ts
const route = {
	path: "/favorites/:favcat?/:order?/:page?/:routeParams?",
	categories: ["picture"],
	example: "/ehentai/favorites/0/posted/0/bittorrent=true&embed_thumb=false",
	parameters: {
		favcat: "Favorites folder number",
		order: "`posted`(Sort by gallery release time) , `favorited`(Sort by time added to favorites)",
		page: "Page number, set 0 to get latest",
		routeParams: "Additional parameters, see the table above"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Favorites",
	maintainers: ["yindaheng98", "syrinka"],
	handler
};
async function handler(ctx) {
	if (!ehapi_default.has_cookie) throw new ConfigNotFoundError("Ehentai favorites RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const favcat = ctx.req.param("favcat") ? Number.parseInt(ctx.req.param("favcat")) : 0;
	const page = ctx.req.param("page");
	const routeParams = new URLSearchParams(ctx.req.param("routeParams"));
	const bittorrent = routeParams.get("bittorrent") || false;
	const embed_thumb = routeParams.get("embed_thumb") || false;
	const inline_set = ctx.req.param("order") === "posted" ? "fs_p" : "fs_f";
	const items = await ehapi_default.getFavoritesItems(cache_default, favcat, inline_set, page, bittorrent, embed_thumb);
	return ehapi_default.from_ex ? {
		title: "ExHentai Favorites",
		link: `https://exhentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
		item: items
	} : {
		title: "E-Hentai Favorites",
		link: `https://e-hentai.org/favorites.php?favcat=${favcat}&inline_set=${inline_set}`,
		item: items
	};
}
//#endregion
export { route };

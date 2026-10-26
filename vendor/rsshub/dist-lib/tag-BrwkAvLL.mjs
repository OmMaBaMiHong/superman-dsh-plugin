import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ehapi_default } from "./ehapi-KLS5HGgL.mjs";
//#region lib/routes/ehentai/tag.ts
const route = {
	path: "/tag/:tag/:page?/:routeParams?",
	categories: ["picture"],
	example: "/ehentai/tag/language:chinese/0/bittorrent=true&embed_thumb=false",
	parameters: {
		tag: "Tag",
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
	name: "Tag",
	maintainers: ["yindaheng98", "syrinka"],
	handler
};
async function handler(ctx) {
	const page = ctx.req.param("page");
	const tag = ctx.req.param("tag");
	const routeParams = new URLSearchParams(ctx.req.param("routeParams"));
	const bittorrent = routeParams.get("bittorrent") || false;
	const embed_thumb = routeParams.get("embed_thumb") || false;
	const items = await ehapi_default.getTagItems(cache_default, tag, page, bittorrent, embed_thumb);
	return ehapi_default.from_ex ? {
		title: tag + " - ExHentai Tag",
		link: `https://exhentai.org/tag/${tag}`,
		item: items
	} : {
		title: tag + " - E-Hentai Tag",
		link: `https://e-hentai.org/tag/${tag}`,
		item: items
	};
}
//#endregion
export { route };

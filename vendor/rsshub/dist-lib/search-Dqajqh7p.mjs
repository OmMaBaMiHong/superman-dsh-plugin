import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as ehapi_default } from "./ehapi-KLS5HGgL.mjs";
//#region lib/routes/ehentai/search.ts
const route = {
	path: "/search/:params?/:page?/:routeParams?",
	categories: ["picture"],
	example: "/ehentai/search/f_cats=1021/0/bittorrent=true&embed_thumb=false",
	parameters: {
		params: "Search parameters. You can copy the content after `https://e-hentai.org/?`",
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
	name: "Search",
	maintainers: ["yindaheng98", "syrinka"],
	handler
};
async function handler(ctx) {
	const page = ctx.req.param("page");
	let params = ctx.req.param("params");
	const routeParams = new URLSearchParams(ctx.req.param("routeParams"));
	const bittorrent = routeParams.get("bittorrent") || false;
	const embed_thumb = routeParams.get("embed_thumb") || false;
	let items;
	if (page) {
		params = params.replace(/&*next=[^&]$/, "").replace(/next=[^&]&/, "");
		items = await ehapi_default.getSearchItems(cache_default, params, page, bittorrent, embed_thumb);
	} else items = await ehapi_default.getSearchItems(cache_default, params, void 0, bittorrent, embed_thumb);
	let title = params;
	const match = /f_search=([^&]+)/.exec(title);
	if (match !== null) title = match[1];
	return ehapi_default.from_ex ? {
		title: title + " - ExHentai Search ",
		link: `https://exhentai.org/?${params}`,
		item: items
	} : {
		title: title + " - E-Hentai Search ",
		link: `https://e-hentai.org/?${params}`,
		item: items
	};
}
//#endregion
export { route };

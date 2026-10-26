import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as getSimple, r as getTorrents, t as getDetails } from "./util-CQo4wvJ0.mjs";
//#region lib/routes/nhentai/search.ts
const route = {
	path: "/search/:keyword/:mode?",
	example: "/nhentai/search/language%3Ajapanese+-scat+-yaoi+-guro+-\"mosaic+censorship\"",
	parameters: {
		keyword: "Keywords for search. You can copy the content after `q=` after searching on the original website, or you can enter it directly. See the [official website](https://nhentai.net/info/) for details",
		mode: "mode, `simple` to only show cover, `detail` to show all pages, `torrent` to include Magnet URI, need login, refer to [Route-specific Configurations](https://docs.rsshub.app/deploy/config#route-specific-configurations), default to `simple`"
	},
	features: {
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: true,
		nsfw: true
	},
	radar: [{
		source: ["nhentai.net/:key/:keyword"],
		target: "/:key/:keyword"
	}],
	name: "Advanced Search",
	maintainers: [
		"MegrezZhu",
		"hoilc",
		"pseudoyu"
	],
	handler
};
async function handler(ctx) {
	const { keyword, mode } = ctx.req.param();
	const url = `https://nhentai.net/search/?q=${keyword}`;
	const simples = await getSimple(url);
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 5;
	let items = simples;
	if (mode === "detail") items = await getDetails(cache_default, simples, limit);
	else if (mode === "torrent") items = await getTorrents(cache_default, simples, limit);
	return {
		title: `nhentai - search - ${keyword}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };

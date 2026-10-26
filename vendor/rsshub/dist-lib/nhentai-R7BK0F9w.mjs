import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as getSimple, r as getTorrents, t as getDetails } from "./util-CQo4wvJ0.mjs";
//#region lib/routes/nhentai/index.ts
const supportedKeys = /* @__PURE__ */ new Set([
	"parody",
	"character",
	"tag",
	"artist",
	"group",
	"language",
	"category"
]);
const route = {
	path: "/index/:key/:keyword/:mode?",
	example: "/nhentai/index/language/chinese",
	parameters: {
		key: "Filter term, can be: `parody`, `character`, `tag`, `artist`, `group`, `language` or `category`",
		keyword: "Filter value",
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
		target: "/index/:key/:keyword"
	}],
	name: "Filter",
	maintainers: [
		"MegrezZhu",
		"hoilc",
		"pseudoyu"
	],
	handler
};
async function handler(ctx) {
	const { key, keyword, mode } = ctx.req.param();
	if (!supportedKeys.has(key)) throw new InvalidParameterError("Unsupported key");
	const url = `https://nhentai.net/${key}/${keyword.toLowerCase().replace(" ", "-")}/`;
	const simples = await getSimple(url);
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 5;
	let items = simples;
	if (mode === "detail") items = await getDetails(cache_default, simples, limit);
	else if (mode === "torrent") items = await getTorrents(cache_default, simples, limit);
	return {
		title: `nhentai - ${key} - ${keyword}`,
		link: url,
		description: "hentai",
		item: items
	};
}
//#endregion
export { route };

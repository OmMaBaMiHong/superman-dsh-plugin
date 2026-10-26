import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as getData } from "./utils-B__hj61-.mjs";
import { load } from "cheerio";
//#region lib/routes/psyche/type.ts
const route = {
	path: "/type/:type",
	categories: ["new-media"],
	example: "/psyche/type/ideas",
	parameters: { type: "Type" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["psyche.co/:type"] }],
	name: "Types",
	maintainers: ["emdoe"],
	handler,
	description: "Supported types: Ideas, Guides, and Films."
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
	const url = `https://psyche.co/${type}`;
	const $ = load(await rofetch(url));
	const data = JSON.parse($("script#__NEXT_DATA__").text());
	const prefix = `https://psyche.co/_next/data/${data.buildId}`;
	const items = await getData(data.props.pageProps.articles.map((item) => ({
		title: item.title,
		link: `${url}/${item.slug}`,
		json: `${prefix}/${type}/${item.slug}.json`
	})));
	return {
		title: `Psyche | ${capitalizedType}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };

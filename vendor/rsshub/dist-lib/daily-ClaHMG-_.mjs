import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as rootUrl, r as processItems, t as apiRootUrl } from "./util-gOgBfx1c.mjs";
import { load } from "cheerio";
//#region lib/routes/readhub/daily.ts
const route = {
	path: "/daily",
	categories: ["new-media"],
	example: "/readhub/daily",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["readhub.cn/daily"] }],
	name: "每日早报",
	maintainers: ["nczitzk", "fashioncj"],
	handler,
	url: "readhub.cn/daily"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 11;
	const currentUrl = new URL("daily", apiRootUrl).href;
	const infoUrl = new URL("daily", rootUrl).href;
	const { data: currentResponse } = await got_default(currentUrl);
	let items = currentResponse.data.items.slice(0, limit).map((item) => ({
		title: item.title,
		link: new URL(`topic/${item.uid}`, rootUrl).href,
		description: `<p>${item.summary}</p>`,
		guid: item.uid
	}));
	items = await processItems(items);
	const { data: currentHTMLResponse } = await got_default(infoUrl);
	const $ = load(currentHTMLResponse);
	const author = $("meta[name=\"application-name\"]").prop("content");
	const subtitle = $("meta[property=\"og:title\"]").prop("content");
	const image = "https://readhub.cn/icons/icon-192x192.png";
	const icon = new URL($("link[rel=\"apple-touch-icon\"]").prop("href"), rootUrl);
	return {
		item: items,
		title: `${author} - ${route.name}`,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh",
		image,
		icon,
		logo: icon,
		subtitle,
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };

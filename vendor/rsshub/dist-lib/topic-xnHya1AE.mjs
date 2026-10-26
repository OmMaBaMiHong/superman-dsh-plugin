import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseArticle, t as baseUrl } from "./utils-DK8zmVwb.mjs";
import { load } from "cheerio";
//#region lib/routes/agirls/topic.ts
const route = {
	path: "/topic/:topic",
	categories: ["new-media"],
	example: "/agirls/topic/AppleWatch",
	parameters: { topic: "精选主题，可通过下方精选主题列表获得" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["agirls.aotter.net/topic/:topic"] }],
	name: "精选主题",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const link = `${baseUrl}/topic/${ctx.req.param("topic")}`;
	const $ = load((await got_default(link)).data);
	const ldJson = JSON.parse($("script[type=\"application/ld+json\"]").text());
	const list = $(".ag-post-item__link").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text().trim(),
			link: `${baseUrl}${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseArticle(item))));
	return {
		title: $("head title").text().trim(),
		link,
		description: ldJson["@graph"][0].description,
		item: items,
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };

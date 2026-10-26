import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as fetchFullArticles, r as rootUrl } from "./utils-DlON7c1Q.mjs";
import { load } from "cheerio";
//#region lib/routes/yicai/carousel.ts
const route = {
	path: "/carousel",
	categories: ["traditional-media"],
	example: "/yicai/carousel",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yicai.com/"] }],
	name: "轮播",
	maintainers: ["nczitzk"],
	handler,
	url: "yicai.com/"
};
async function handler() {
	const $ = load(await rofetch(rootUrl));
	return {
		title: "第一财经 - 轮播",
		link: rootUrl,
		item: await Promise.all(fetchFullArticles($("#breaknews a").toArray().map((e) => ({
			link: new URL($(e).attr("href"), rootUrl).href,
			title: $(e).text()
		}))))
	};
}
//#endregion
export { route };

import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/weekly.ts
const host = "https://www.zhihu.com";
const route = {
	path: "/weekly",
	categories: ["social-media"],
	example: "/zhihu/weekly",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zhihu.com/pub/weekly"] }],
	name: "知乎书店 - 知乎周刊",
	maintainers: ["LogicJake"],
	handler,
	url: "www.zhihu.com/pub/weekly"
};
async function handler() {
	const link = "https://www.zhihu.com/pub/weekly";
	const $ = load((await got_default(link)).data);
	return {
		title: "知乎周刊",
		link,
		description: $("p.Weekly-description").text(),
		item: $("div.Card-section.PubBookListItem").slice(0, 10).toArray().map((element) => {
			return {
				title: $(element).find("span.PubBookListItem-title").text(),
				link: new URL($(element).find("a.PubBookListItem-buttonWrapper").attr("href"), host).href,
				description: $(element).find("div.PubBookListItem-description").text(),
				author: $(element).find("span.PubBookListItem-author").text()
			};
		})
	};
}
//#endregion
export { route };

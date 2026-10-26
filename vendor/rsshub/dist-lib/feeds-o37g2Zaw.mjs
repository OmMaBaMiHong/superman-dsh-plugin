import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/foreverblog/feeds.ts
const route = {
	path: "/feeds",
	categories: ["blog"],
	example: "/foreverblog/feeds",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.foreverblog.cn/feeds.html"] }],
	name: "专题展示 - 文章",
	maintainers: ["7Wate", "a180285"],
	handler,
	url: "www.foreverblog.cn/feeds.html"
};
async function handler() {
	const currentUrl = "https://www.foreverblog.cn/feeds.html";
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "十年之约——专题展示",
		link: currentUrl,
		item: $("article[class=\"post post-type-normal\"]").toArray().map((el) => {
			const $titleDiv = $(el).find("h1[class=\"post-title\"]");
			const title = $titleDiv.text().trim();
			const link = $titleDiv.find("a").eq(0).attr("href");
			const author = $(el).find("div[class=\"post-author\"]").text().trim();
			const pubDate = timezone(parseDate($(el).find("time").text().trim(), "MM-DD"), 8);
			const description = `${author}: ${title}`;
			return {
				title: description,
				description,
				link,
				pubDate
			};
		})
	};
}
//#endregion
export { route };

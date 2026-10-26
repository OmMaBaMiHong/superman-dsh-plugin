import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/nextapple/realtime.ts
const route = {
	path: "/realtime/:category?",
	categories: ["new-media"],
	example: "/nextapple/realtime/latest",
	parameters: { category: "類別，見下表，默認為首頁" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tw.nextapple.com/", "tw.nextapple.com/realtime/:category"] }],
	name: "最新新聞",
	maintainers: ["miles170"],
	handler,
	url: "tw.nextapple.com/",
	description: `| 首頁   | 焦點      | 熱門 | 娛樂          | 生活 | 女神     | 社會  |
| ------ | --------- | ---- | ------------- | ---- | -------- | ----- |
| latest | recommend | hit  | entertainment | life | gorgeous | local |

| 政治     | 國際          | 財經    | 體育   | 旅遊美食  | 3C 車市 |
| -------- | ------------- | ------- | ------ | --------- | ------- |
| politics | international | finance | sports | lifestyle | gadget  |`
};
async function handler(ctx) {
	const currentUrl = `https://tw.nextapple.com/realtime/${ctx.req.param("category") ?? "latest"}`;
	const $ = load((await got_default(currentUrl)).data);
	const items = await pMap($("article.infScroll").toArray(), (item) => {
		const link = $(item).find(".post-title").attr("href");
		return cache_default.tryGet(link, async () => {
			const $ = load((await got_default(link)).data);
			const mainContent = $("#main-content");
			const titleElement = mainContent.find("header h1");
			const title = titleElement.text();
			titleElement.remove();
			const postMetaElement = mainContent.find(".post-meta");
			const category = postMetaElement.find(".category").text();
			const pubDate = parseDate(postMetaElement.find("time").attr("datetime"));
			postMetaElement.remove();
			$(".post-comments").remove();
			return {
				title,
				description: mainContent.html(),
				category,
				pubDate,
				link
			};
		});
	}, { concurrency: 5 });
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

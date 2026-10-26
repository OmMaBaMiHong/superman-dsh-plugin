import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/europechinese/latest.ts
const route = {
	path: "/latest",
	categories: ["new-media"],
	example: "/europechinese/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["europechinese.blogspot.com"] }],
	name: "最新",
	maintainers: ["emdoe"],
	handler,
	url: "europechinese.blogspot.com/"
};
async function handler() {
	const url = "https://europechinese.blogspot.com/";
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $("h3.post-title");
	return {
		title: "歐洲動態（國際）| 最新",
		link: url,
		item: await Promise.all(list.map((_, item) => {
			const title = $(item).find("a").text();
			const link = $(item).find("a").attr("href");
			return cache_default.tryGet(link, async () => {
				const { data: response } = await got_default(link);
				const $ = load(response);
				$("div.widget-content").remove();
				$("div.byline").remove();
				$("div.post-sidebar").remove();
				const time = $("time.published").attr("datetime");
				const text = $("div.post-body-container").html();
				return {
					title,
					link,
					guid: link,
					description: text,
					pubDate: time
				};
			});
		}))
	};
}
//#endregion
export { route };

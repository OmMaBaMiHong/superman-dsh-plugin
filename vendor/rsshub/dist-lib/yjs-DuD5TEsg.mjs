import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/snnu/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/snnu/yjs",
	url: "newyjs.snnu.edu.cn",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生院通知公告",
	maintainers: ["alterkeyy"],
	radar: [{
		source: ["newyjs.snnu.edu.cn/tzgg1.htm"],
		target: "/yjs"
	}],
	handler: async () => {
		const url = "https://newyjs.snnu.edu.cn/tzgg1.htm";
		const $ = load(await rofetch(url));
		const list = $(".n_bt li").toArray().slice(0, 10);
		return {
			title: "陕西师范大学 - 研究生院通知公告",
			link: url,
			image: "https://newyjs.snnu.edu.cn/2024html/images24/logo01.png",
			item: await Promise.all(list.map((item) => {
				const $link = $(item).find("a").first();
				const link = new URL($link.attr("href") || "", url).href;
				const pubDate = parseDate($link.find("em").text());
				const title = $link.attr("title") || $link.find("p").text() || $link.text();
				return cache_default.tryGet(link, async () => {
					try {
						const $$ = load(await rofetch(link));
						const description = $$(".v_news_content").html() || $$("#vsb_content").html() || "";
						return {
							title,
							link,
							description,
							pubDate
						};
					} catch {
						return {
							title,
							link,
							pubDate
						};
					}
				});
			}))
		};
	}
};
//#endregion
export { route };

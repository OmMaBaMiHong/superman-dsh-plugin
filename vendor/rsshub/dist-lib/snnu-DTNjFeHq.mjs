import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/snnu/index.ts
const route = {
	path: "/",
	categories: ["university"],
	example: "/snnu",
	url: "www.snnu.edu.cn",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "学校官网 - 通知公告",
	maintainers: ["alterkeyy"],
	radar: [{
		source: ["www.snnu.edu.cn/tzgg.htm"],
		target: "/"
	}],
	handler: async () => {
		const url = "https://www.snnu.edu.cn/tzgg.htm";
		const $ = load(await rofetch(url));
		const list = $(".ul-txtq3 li").toArray().slice(0, 10);
		return {
			title: "陕西师范大学 - 通知公告",
			link: url,
			image: "https://www.snnu.edu.cn/images/logo.png",
			item: await Promise.all(list.map((item) => {
				const $item = $(item);
				const $link = $item.find("a").first();
				const link = new URL($link.attr("href") || "", url).href;
				const pubDate = parseDate($item.find(".date.date2").first().text());
				let title = $item.find("a .txt h3").first().text();
				if (!title) title = $link.text();
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

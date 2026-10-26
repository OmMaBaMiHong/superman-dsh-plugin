import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/cs.ts
const route = {
	path: "/cs",
	categories: ["university"],
	example: "/ecnu/cs",
	radar: [{
		source: ["cs.ecnu.edu.cn"],
		target: "/cs"
	}],
	name: "计算机科学与技术学院通知公告",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "https://cs.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}19867/list.htm`)).data);
		const links = $("div#wp_news_w6 ul.data-list > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find("span").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").text()
		}));
		return {
			title: "计算机科学与技术学院通知公告",
			link: "https://cs.ecnu.edu.cn/19867/list.htm",
			item: await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
				const { data } = await got_default(item.link);
				const $ = load(data);
				const $read = $("div.view-cnt");
				$read.find("img[src], a[href]").each((i, el) => {
					const $el = $(el);
					const attr = el.tagName === "img" ? "src" : "href";
					const val = $el.attr(attr);
					if (val) $el.attr(attr, new URL(val, baseUrl).href);
				});
				item.description = $read.html()?.trim();
				return item;
			})))
		};
	}
};
//#endregion
export { route };

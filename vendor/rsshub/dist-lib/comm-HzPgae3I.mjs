import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/comm.ts
const route = {
	path: "/comm",
	categories: ["university"],
	example: "/ecnu/comm",
	radar: [{
		source: ["comm.ecnu.edu.cn"],
		target: "/comm"
	}],
	name: "传播学院通知公告",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "https://comm.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}41511/list.htm`)).data);
		const links = $("ul.news_list.list2 > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find(".news_meta").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").text()
		}));
		return {
			title: "传播学院通知公告",
			link: "https://comm.ecnu.edu.cn/41511/list.htm",
			item: await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
				const { data } = await got_default(item.link);
				const $ = load(data);
				const $read = $("div.wp_articlecontent");
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

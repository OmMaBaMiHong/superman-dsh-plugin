import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/psy.ts
const route = {
	path: "/psy",
	categories: ["university"],
	example: "/ecnu/psy",
	radar: [{
		source: ["psy.ecnu.edu.cn"],
		target: "/psy"
	}],
	name: "心理与认知科学学院通知公告",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "https://psy.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}tzgg/list.htm`)).data);
		const links = $("ul.wp_article_list > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find(".Article_PublishDate").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").attr("title")
		}));
		return {
			title: "心理与认知科学学院通知公告",
			link: "https://psy.ecnu.edu.cn/tzgg/list.htm",
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

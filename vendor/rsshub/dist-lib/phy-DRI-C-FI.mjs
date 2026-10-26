import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/phy.ts
const route = {
	path: "/phy",
	categories: ["university"],
	example: "/ecnu/phy",
	radar: [{
		source: ["phy.ecnu.edu.cn"],
		target: "/phy"
	}],
	name: "物理与电子科学学院通知公告",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "https://phy.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}1605/list.htm`)).data);
		const links = $("ul.data-list > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find("span").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").attr("title")
		}));
		return {
			title: "物理与电子科学学院通知公告",
			link: "https://phy.ecnu.edu.cn/1605/list.htm",
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

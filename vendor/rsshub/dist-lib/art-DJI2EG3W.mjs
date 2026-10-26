import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/art.ts
const type = (filename) => filename.split(".").pop();
const route = {
	path: "/art",
	categories: ["university"],
	example: "/ecnu/art",
	radar: [{
		source: ["art.ecnu.edu.cn"],
		target: "/art"
	}],
	name: "美术学院通知公告",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "https://art.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}tzggwzpw/list.htm`)).data);
		const links = $("ul.data-list > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find("span").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").text()
		}));
		return {
			title: "美术学院通知公告",
			link: "https://art.ecnu.edu.cn/tzggwzpw/list.htm",
			item: await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
				if (type(item.link) === "htm") {
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
				}
				item.description = "请到原网页访问";
				return item;
			})))
		};
	}
};
//#endregion
export { route };

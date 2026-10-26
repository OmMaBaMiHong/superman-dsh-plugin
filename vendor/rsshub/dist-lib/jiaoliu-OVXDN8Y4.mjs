import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/jiaoliu.ts
const route = {
	path: "/jiaoliu",
	categories: ["university"],
	example: "/ecnu/jiaoliu",
	radar: [{
		source: ["www.jiaoliu.ecnu.edu.cn"],
		target: "/jiaoliu"
	}],
	name: "本科生交流通知",
	maintainers: [
		"FrozenStarrrr",
		"ChiyoYuki",
		"ECNU-minus"
	],
	handler: async () => {
		const baseUrl = "http://www.jiaoliu.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}11184/list.htm`)).data);
		const links = $("#wp_news_w3 > table > tbody > tr").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find("div[style=\"white-space:nowrap\"]").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").text()
		}));
		return {
			title: "本科生交流通知",
			link: baseUrl,
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

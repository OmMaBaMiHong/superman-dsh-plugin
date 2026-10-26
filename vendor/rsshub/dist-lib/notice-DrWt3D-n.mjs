import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/notice.ts
const route = {
	path: "/notice",
	categories: ["university"],
	example: "/nankai/notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.nankai.edu.cn", "www.nankai.edu.cn/157/list.htm"] }],
	name: "通知公告",
	maintainers: ["vicguo0724"],
	handler: async () => {
		const baseUrl = "https://www.nankai.edu.cn";
		const listUrl = `${baseUrl}/157/list.htm`;
		const { data: response } = await got_default(listUrl);
		const $ = load(response);
		const list = $("ul.newslist li").toArray().map((item) => {
			const $item = $(item);
			const $time = $item.find(".time");
			const day = $time.find(".time-d").text().trim();
			const pubDate = timezone(parseDate(`${$time.contents().last().text().trim()}-${day}`, "YYYY-MM-DD"), 8);
			const $link = $item.find(".tit a");
			let href = $link.attr("href") || "";
			href = href.startsWith("http") ? href : new URL(href, baseUrl).href;
			return {
				title: $link.text().trim(),
				link: href,
				pubDate
			};
		});
		return {
			title: "南开大学通知公告",
			link: listUrl,
			item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
				try {
					if (item.link.includes("xb.nankai.edu.cn")) item.description = "该通知可能需要校内访问权限";
					else {
						const { data: detailResponse } = await got_default(item.link);
						item.description = load(detailResponse)(".wp_articlecontent").html() || "";
					}
				} catch {
					item.description = "正文内容获取失败";
				}
				return item;
			})))
		};
	}
};
//#endregion
export { route };

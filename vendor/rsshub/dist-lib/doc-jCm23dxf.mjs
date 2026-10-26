import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/suzhou/doc.ts
const route = {
	path: "/doc",
	categories: ["government"],
	example: "/gov/suzhou/doc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp", "www.suzhou.gov.cn/"] }],
	name: "政府信息公开文件",
	maintainers: ["EsuRt"],
	handler,
	url: "www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp"
};
async function handler() {
	const link = "https://www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp";
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".tr_main_value_odd").toArray().map((item) => {
		item = $(item);
		const title = item.find("a");
		return {
			title: title.attr("title"),
			link: `https://www.suzhou.gov.cn${title.attr("href")}`,
			pubDate: timezone(parseDate(item.find("td:nth-child(3)").text().trim()), 8)
		};
	});
	return {
		title: "苏州市政府 - 政策公开文件",
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			item.description = $(".article-content").html();
			item.author = $("dd.addWidth:nth-child(3) div").text().trim();
			item.pubDate = $("meta[name=\"PubDate\"]").length ? timezone(parseDate($("meta[name=\"PubDate\"]").attr("content"), "YYYY-MM-DD HH:mm:ss"), 8) : item.pubDate;
			item.category = $(".OwnerDept font").toArray().map((item) => $(item).text().trim());
			return item;
		})))
	};
}
//#endregion
export { route };

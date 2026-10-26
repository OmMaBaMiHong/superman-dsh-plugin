import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cdu/cdrw.ts
const route = {
	path: "/cdrw",
	categories: ["university"],
	example: "/cdu/cdrw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.cdu.edu.cn/"] }],
	name: "成大人物",
	maintainers: ["uuwor"],
	handler,
	url: "news.cdu.edu.cn/"
};
async function handler() {
	const baseUrl = "https://news.cdu.edu.cn";
	const url = `${baseUrl}/cdrw.htm`;
	const $ = load((await got_default.get(url)).data);
	const list = $(".row-f1 ul.ul-mzw-news-a2 li a.con").slice(0, 10).toArray().map((item) => {
		const element = $(item);
		const title = element.attr("title") || element.find(".tit").text().trim();
		const link = element.attr("href");
		const pubDate = timezone(parseDate(element.find(".date").text().trim()), 8);
		return {
			title,
			link: link.startsWith("http") ? link : new URL(link, baseUrl).href,
			pubDate,
			author: "成都大学新闻网"
		};
	});
	return {
		title: "人物",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default.get(item.link)).data)(".v_news_content");
			content.find("*[style*=\"text-align: right\"]").remove();
			item.description = content.html();
			return item;
		})))
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ouc/jwc.ts
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/ouc/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwc.ouc.edu.cn/", "jwc.ouc.edu.cn/6517/list.htm"] }],
	name: "教务处",
	maintainers: ["3401797899"],
	handler,
	url: "jwc.ouc.edu.cn/"
};
async function handler() {
	const link = "https://jwc.ouc.edu.cn/6517/list.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".wp_article_list li").toArray().map((e) => {
		e = $(e);
		const a = e.find("a");
		return {
			title: a.attr("title"),
			link: a.attr("href").startsWith("http") ? a.attr("href") : "https://jwc.ouc.edu.cn" + a.attr("href"),
			pubDate: parseDate(e.find("span.Article_PublishDate").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "中国海洋大学教务处",
		link,
		description: "中国海洋大学教务处最新通知",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			item.author = "中国海洋大学教务处";
			item.description = $(".wp_articlecontent").html();
			return item;
		})))
	};
}
//#endregion
export { route };

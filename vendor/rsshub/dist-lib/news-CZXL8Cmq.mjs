import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gdufs/news.ts
const site = "https://www.gdufs.edu.cn";
const route = {
	path: "/news",
	categories: ["university"],
	example: "/gdufs/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.gdufs.edu.cn/gwxw/gwxw1.htm", "www.gdufs.edu.cn/"] }],
	name: "新闻",
	maintainers: ["gz4zzxc"],
	handler,
	url: "www.gdufs.edu.cn/gwxw/gwxw1.htm"
};
async function handler() {
	const link = "https://www.gdufs.edu.cn/gwxw/gwxw1.htm";
	const $ = load((await got_default(link)).body);
	const list = $("ul.list_luntan li");
	return {
		title: "广外-大学要闻",
		link,
		description: "广东外语外贸大学-大学要闻",
		item: await Promise.all(list.toArray().map((element) => {
			const item = $(element);
			const href = item.find("a").attr("href") || "";
			const title = item.find("h5").text().trim();
			const day = item.find("h3").text().trim();
			const dateString = item.find("h6").text().trim() + "/" + day;
			const fullLink = href.startsWith("http") ? href : new URL(href, site).href;
			const pubDate = parseDate(dateString).toUTCString();
			return cache_default.tryGet(fullLink, async () => {
				try {
					const $$ = load((await got_default(fullLink)).body);
					const description = $$(".v_news_content").html()?.trim() || "";
					let author = "";
					$$(".nav01 h6 .ll span").each((_, el) => {
						const text = $$(el).text().trim();
						if (text.includes("责任编辑：")) author = text.replace("责任编辑：", "").trim();
						else if (text.includes("文字：")) author = text.replace("文字：", "").trim();
					});
					return {
						title,
						link: fullLink,
						description,
						pubDate,
						author
					};
				} catch {
					return {
						title,
						link: fullLink,
						description: "内容获取失败。",
						pubDate,
						author: ""
					};
				}
			});
		}))
	};
}
//#endregion
export { route };

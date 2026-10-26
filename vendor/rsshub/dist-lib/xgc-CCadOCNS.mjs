import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/xgc.ts
const baseTitle = "南信大学生工作处";
const baseUrl = "https://xgc.nuist.edu.cn";
const route = {
	path: "/xgc",
	categories: ["university"],
	example: "/nuist/xgc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xgc.nuist.edu.cn/", "xgc.nuist.edu.cn/419/list.htm"] }],
	name: "南信大学生工作处",
	maintainers: ["gylidian"],
	handler,
	url: "xgc.nuist.edu.cn/"
};
async function handler() {
	const link = "https://xgc.nuist.edu.cn/419/list.htm";
	const $ = load((await got_default(link)).data);
	const list = $(".wp_article_list .list_item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".Article_PublishDate").text(), "YYYY-MM-DD")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link)).data);
			item.author = $(".arti_metas").find(".arti_publisher").text().replace("作者：", "");
			item.description = $(".entry").html();
		} catch {}
		return item;
	})));
	return {
		title: baseTitle,
		link,
		item: items.filter(Boolean)
	};
}
//#endregion
export { route };

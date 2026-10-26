import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/seu/cyber/index.ts
const route = {
	path: "/cyber/tzgg",
	categories: ["university"],
	example: "/seu/cyber/tzgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cyber.seu.edu.cn/tzgg/list.htm", "cyber.seu.edu.cn/"] }],
	name: "网络空间安全学院 - 通知公告",
	maintainers: ["shrugginG"],
	handler,
	description: "东南大学网络空间安全学院通知公告"
};
async function handler() {
	const host = "https://cyber.seu.edu.cn";
	const link = `${host}/tzgg/list.htm`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $("#wp_news_w6 ul.wp_article_list li.list_item").toArray().map((item) => {
		const e = $(item);
		const a = e.find(".Article_Title a");
		const title = a.text().trim();
		const href = a.attr("href");
		const dateText = e.find(".Article_PublishDate").text().trim();
		return {
			title,
			link: new URL(href || "", host).href,
			pubDate: parseDate(dateText),
			description: ""
		};
	});
	return {
		link,
		title: "东南大学网络空间安全学院 - 通知公告",
		description: "东南大学网络空间安全学院通知公告RSS",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const $ = load((await got_default(item.link)).data);
				item.description = $(".wp_articlecontent").html() || $(".article-content").html() || $(".main-text").html() || $("article").html() || "";
				return item;
			} catch {
				return item;
			}
		})))
	};
}
//#endregion
export { route };

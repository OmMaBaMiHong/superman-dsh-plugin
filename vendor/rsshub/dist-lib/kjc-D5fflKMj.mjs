import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjfu/kjc.ts
const route = {
	path: "/kjc",
	categories: ["university"],
	example: "/bjfu/kjc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["kyc.bjfu.edu.cn/"] }],
	name: "科技处通知公告",
	maintainers: ["markmingjie"],
	handler,
	url: "kyc.bjfu.edu.cn/"
};
async function handler() {
	const url = "http://kyc.bjfu.edu.cn/tztg/index.html";
	const data = (await got_default.get(url)).data;
	const $ = load(data);
	const list = $(".ll_con_r_b li").slice(0, 15).toArray().map((e) => {
		const element = $(e);
		const title = element.find(".ll_con_r_b_title a").text();
		const link = element.find("a").attr("href");
		const pubDate = timezone(parseDate(element.find(".ll_con_r_b_time").text().match(/\d{4}-\d{2}-\d{2}/)), 8);
		return {
			title,
			link: "http://kyc.bjfu.edu.cn/tztg/" + link,
			author: "北京林业大学科技处通知公告",
			pubDate
		};
	});
	return {
		title: "北林科技处通知",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const data = (await got_default.get(item.link)).data;
			const itemElement = load(data);
			item.description = itemElement("#a_con_l_con").html();
			item.title = item.title.includes("...") ? itemElement("#a_con_l_title").text() : item.title;
			return item;
		})))
	};
}
//#endregion
export { route };

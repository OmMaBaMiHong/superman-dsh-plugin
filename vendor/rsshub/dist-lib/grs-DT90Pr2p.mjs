import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bjfu/grs.ts
const route = {
	path: "/grs",
	categories: ["university"],
	example: "/bjfu/grs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["graduate.bjfu.edu.cn/"] }],
	name: "研究生院培养动态",
	maintainers: ["markmingjie"],
	handler,
	url: "graduate.bjfu.edu.cn/"
};
async function handler() {
	const url = "http://graduate.bjfu.edu.cn/pygl/pydt/index.html";
	const data = (await got_default.get(url)).data;
	const $ = load(data);
	const list = $(".itemList li").slice(0, 11).toArray().map((e) => {
		const element = $(e);
		const title = element.find("li a").attr("title");
		const link = element.find("li a").attr("href");
		const pubDate = timezone(parseDate(element.find("li a").text().match(/\d{4}-\d{2}-\d{2}/)), 8);
		return {
			title,
			link: "http://graduate.bjfu.edu.cn/pygl/pydt/" + link,
			author: "北京林业大学研究生院培养动态",
			pubDate
		};
	});
	return {
		title: "北林研培养动态",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const data = (await got_default.get(item.link)).data;
			item.description = load(data)(".articleTxt").html();
			return item;
		})))
	};
}
//#endregion
export { route };

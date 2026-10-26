import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qust/jw.ts
const baseUrl = "https://jw.qust.edu.cn/";
const route = {
	path: "/jw",
	categories: ["university"],
	example: "/qust/jw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jw.qust.edu.cn/jwtz.htm", "jw.qust.edu.cn/"] }],
	name: "教务通知",
	maintainers: ["Silent-wqh"],
	handler,
	url: "jw.qust.edu.cn/jwtz.htm"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: `${baseUrl}jwtz.htm`
	})).data);
	const items = $(".winstyle60982 tr a.c60982").toArray().map((element) => {
		const linkElement = $(element);
		const itemTitle = linkElement.text().trim();
		const path = linkElement.attr("href");
		return {
			title: itemTitle,
			link: path.startsWith("http") ? path : `${baseUrl}${path}`
		};
	});
	return {
		title: "青岛科技大学 - 教务通知",
		link: `${baseUrl}jwtz.htm`,
		item: items
	};
}
//#endregion
export { route };

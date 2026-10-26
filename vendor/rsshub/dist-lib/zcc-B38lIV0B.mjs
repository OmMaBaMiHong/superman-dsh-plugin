import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/zcc.ts
const route = {
	path: "/zcc",
	categories: ["university"],
	example: "/nju/zcc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"zcc.nju.edu.cn/tzgg/gyfytdglk/index.html",
		"zcc.nju.edu.cn/tzgg/index.html",
		"zcc.nju.edu.cn/"
	] }],
	name: "资产管理处",
	maintainers: ["ret-1"],
	handler,
	url: "zcc.nju.edu.cn/tzgg/gyfytdglk/index.html"
};
async function handler() {
	return {
		title: "资产管理处-公告通知",
		link: "https://zcc.nju.edu.cn/sy/tzzhxx/index.html",
		item: (await Promise.all(Object.keys({ ggtz: "公告通知" }).map(async () => {
			const data = (await got_default("https://zcc.nju.edu.cn/sy/tzzhxx/index.html")).data;
			let script = load(data)("ul.clearfix").find("script");
			script = script["1"].children[0].data;
			const start = script.indexOf("[");
			const end = script.lastIndexOf("]");
			return JSON.parse(script.slice(start, end + 1))[0].infolist.map((item) => ({
				title: item.title,
				description: item.summary,
				link: item.url,
				author: item.username,
				pubDate: parseDate(item.releasetime, "x")
			}));
		})))[0]
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/admission.ts
const route = {
	path: "/admission",
	categories: ["university"],
	example: "/nju/admission",
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
		"admission.nju.edu.cn/tzgg/index.html",
		"admission.nju.edu.cn/tzgg",
		"admission.nju.edu.cn/"
	] }],
	name: "本科迎新",
	maintainers: ["ret-1"],
	handler,
	url: "admission.nju.edu.cn/tzgg/index.html"
};
async function handler() {
	return {
		title: "本科迎新-通知公告",
		link: "https://admission.nju.edu.cn/tzgg",
		item: (await Promise.all(Object.keys({ tzgg: "通知公告" }).map(async () => {
			const data = (await got_default("https://admission.nju.edu.cn/tzgg")).data;
			let script = load(data)("ul").find("script");
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

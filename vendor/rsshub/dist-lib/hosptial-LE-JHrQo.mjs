import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/hosptial.ts
const route = {
	path: "/hospital",
	categories: ["university"],
	example: "/nju/hospital",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hospital.nju.edu.cn/ggtz/index.html"] }],
	name: "校医院",
	maintainers: ["ret-1"],
	handler,
	url: "hospital.nju.edu.cn/ggtz/index.html"
};
async function handler() {
	return {
		title: "校医院-公告通知",
		link: "https://hospital.nju.edu.cn/ggtz/index.html",
		item: (await Promise.all(Object.keys({ ggtz: "公告通知" }).map(async () => {
			const data = (await got_default("https://hospital.nju.edu.cn/ggtz/index.html")).data;
			let script = load(data)("div .wrapper").find("script");
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

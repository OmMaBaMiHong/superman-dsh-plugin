import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/ecnu/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.kaoyan.com/ecnu/tiaoji", "yz.kaoyan.com/"] }],
	name: "研究生院",
	maintainers: ["shengmaosu"],
	handler,
	url: "yz.kaoyan.com/ecnu/tiaoji"
};
async function handler() {
	const link = "https://yz.kaoyan.com/ecnu/tiaoji/";
	const $ = load((await got_default(link)).data);
	const list = $(".subList li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("li a").text(),
			link: item.find("li a").attr("href").replace("http:", "https:")
		};
	});
	return {
		title: "华东师范大学研究生院",
		link,
		description: "华东师范大学研究生调剂信息",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			item.description = $(".articleCon").html();
			item.pubDate = parseDate($(".outer_utime").text());
			return item;
		})))
	};
}
//#endregion
export { route };

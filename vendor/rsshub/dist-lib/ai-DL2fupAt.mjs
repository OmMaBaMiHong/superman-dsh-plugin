import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ucas/ai.ts
const route = {
	path: "/ai",
	categories: ["university"],
	example: "/ucas/ai",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ai.ucas.ac.cn/index.php/zh-cn/tzgg", "ai.ucas.ac.cn/"] }],
	name: "人工智能学院",
	maintainers: ["shengmaosu"],
	handler,
	url: "ai.ucas.ac.cn/index.php/zh-cn/tzgg"
};
async function handler() {
	const baseUrl = "https://ai.ucas.ac.cn";
	const link = `${baseUrl}/index.php/zh-cn/tzgg`;
	const $ = load((await got_default(link)).data);
	const list = $(".b-list li");
	return {
		title: "中科院人工智能所",
		link,
		description: "中科院人工智能通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.text(),
				link: `${baseUrl}${a.attr("href")}`,
				pubDate: parseDate(item.find(".m-date").text(), "YYYY-MM-DD")
			};
		})
	};
}
//#endregion
export { route };

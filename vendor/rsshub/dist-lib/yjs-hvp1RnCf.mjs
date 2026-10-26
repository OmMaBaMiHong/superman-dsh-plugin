import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scnu/yjs.ts
const route = {
	path: "/yjs",
	categories: ["university"],
	example: "/scnu/yjs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.scnu.edu.cn/tongzhigonggao/ssgg", "yz.scnu.edu.cn/"] }],
	name: "研究生院通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "yz.scnu.edu.cn/tongzhigonggao/ssgg"
};
async function handler() {
	const link = "https://yz.scnu.edu.cn/tongzhigonggao/ssgg/";
	const $ = load((await got_default(link)).data);
	const list = $(".listmod div a");
	return {
		title: "华南师范大学研究生院",
		link,
		description: "华南师范大学研究生院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.text(),
				link: item.attr("href")
			};
		})
	};
}
//#endregion
export { route };

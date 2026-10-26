import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ccnu/career.ts
const route = {
	path: "/career",
	categories: ["university"],
	example: "/ccnu/career",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ccnu.91wllm.com/news/index/tag/tzgg", "ccnu.91wllm.com/"] }],
	name: "就业信息",
	maintainers: ["jackyu1996"],
	handler,
	url: "ccnu.91wllm.com/news/index/tag/tzgg"
};
async function handler() {
	const host = "https://ccnu.91wllm.com";
	const link = `${host}/news/index/tag/tzgg`;
	const $ = load((await got_default(link)).data);
	const list = $(".newsList");
	return {
		title: "华中师范大学就业信息",
		link,
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			return {
				title: a.text(),
				pubDate: parseDate(item.find(".y").text(), "YYYY-MM-DD"),
				link: `${host}${a.attr("href")}`
			};
		})
	};
}
//#endregion
export { route };

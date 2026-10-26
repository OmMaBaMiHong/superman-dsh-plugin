import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cuc/yz.ts
const route = {
	path: "/yz",
	categories: ["university"],
	example: "/cuc/yz",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.cuc.edu.cn/8549/list.htm", "yz.cuc.edu.cn/"] }],
	name: "研究生招生网",
	maintainers: ["niuyi1017"],
	handler,
	url: "yz.cuc.edu.cn/8549/list.htm"
};
async function handler() {
	const host = "https://yz.cuc.edu.cn";
	const link = `${host}/8549/list.htm`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const items = $(".news_list li").toArray().map((elem) => {
		elem = $(elem);
		const a = elem.find("a");
		return {
			link: new URL(a.attr("href"), host).href,
			title: a.attr("title"),
			pubDate: parseDate(elem.find(".news_meta").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: $("title").text(),
		link,
		description: "中国传媒大学研究生招生网 通知公告",
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tingshuitz/dongguan.ts
const route = {
	path: "/dongguan",
	categories: ["forecast"],
	example: "/tingshuitz/dongguan",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "东莞市",
	maintainers: ["victoriqueko"],
	handler
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "http://www.djsw.com.cn/news/tstz/index.html"
	})).data;
	const $ = load(data);
	const list = $("#cntR li");
	return {
		title: $("title").text() || "停水通知 - 东莞市东江水务有限公司",
		link: "http://www.djsw.com.cn/news/tstz/index.html",
		description: $("title").text() || "停水通知 - 东莞市东江水务有限公司",
		item: list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").text(),
				description: `东莞市停水通知：${item.find("a").text()}`,
				pubDate: parseDate($(item.contents()[1]).text().slice(1, -1)),
				link: item.find("a").attr("href")
			};
		})
	};
}
//#endregion
export { route };

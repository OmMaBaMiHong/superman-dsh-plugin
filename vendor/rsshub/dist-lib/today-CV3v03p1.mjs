import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/yyets/today.ts
const route = {
	path: "/today",
	categories: ["multimedia"],
	view: 5,
	example: "/yyets/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yysub.net/tv/schedule", "yysub.net/"] }],
	name: "今日播出",
	maintainers: ["bao1991213"],
	handler,
	url: "yysub.net/tv/schedule"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://yysub.net"
	})).data;
	const $ = load(data);
	return {
		title: "人人影视-今日播出",
		link: "https://yysub.net",
		item: $(".today-list-wrap").find("ul").find("li").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").first().text(),
				link: item.find("a").attr("href"),
				guid: item.find("a").first().text()
			};
		})
	};
}
//#endregion
export { route };

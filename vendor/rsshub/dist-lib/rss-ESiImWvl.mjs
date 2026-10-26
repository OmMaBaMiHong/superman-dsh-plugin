import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/dbaplus/rss.ts
const route = {
	path: "/",
	categories: ["programming"],
	example: "/dbaplus",
	radar: [{ source: ["dbaplus.cn/"] }],
	name: "最新文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "dbaplus.cn/"
};
async function handler() {
	const url = "https://dbaplus.cn";
	const $ = load((await got_default(`${url}/news-9-1.html`)).data);
	return {
		title: "dbaplus社群",
		link: url,
		item: $("div.col-xs-12.col-md-8.pd30 > div.panel.panel-default.categeay > div.panel-body > ul.media-list.clearfix > li.media").toArray().map((e) => {
			const element = $(e);
			const title = element.find("h3 > a").text();
			const link = element.find("h3 > a").attr("href");
			return {
				title,
				description: element.find("div.mt10.geay").text(),
				link,
				pubDate: parseDate(element.find("span.time").text(), "YYYY年MM月DD日")
			};
		})
	};
}
//#endregion
export { route };

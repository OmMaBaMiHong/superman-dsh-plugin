import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hacking8/search.ts
const route = {
	path: "/search/:keyword?",
	categories: ["programming"],
	example: "/hacking8/search/rsshub",
	parameters: { keyword: "关键字，默认为空" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["hacking8.com/index/:category", "hacking8.com/"],
		target: "/:category?"
	}],
	name: "搜索",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword") ?? "";
	const rootUrl = "https://i.hacking8.com";
	const currentUrl = `${rootUrl}/search/?q=${keyword}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $("div.media").toArray().map((item) => {
		item = $(item);
		const a = item.find("div.link a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), rootUrl).href,
			description: item.find("div.media-body pre").text(),
			pubDate: timezone(parseDate(item.parent().parent().find("td").first().text(), "YYYY年M月D日 HH:mm"), 8),
			category: item.parent().parent().find("span.label").toArray().map((l) => $(l).text())
		};
	});
	return {
		title: `Hacking8 安全信息流 - ${$("title").text().replaceAll(/总数:\d+/g, "").trim()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

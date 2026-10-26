import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gihyo/group.ts
const route = {
	path: "/list/group/:id",
	categories: ["programming"],
	example: "/gihyo/list/group/Ubuntu-Weekly-Recipe",
	parameters: { id: "Series" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gihyo.jp/list/group/:id"] }],
	name: "Series",
	maintainers: ["masakichi"],
	handler
};
async function handler(ctx) {
	const groupId = ctx.req.param("id");
	const baseUrl = "https://gihyo.jp";
	const url = `${baseUrl}/list/group/${groupId}`;
	const $ = load((await got_default(url)).data);
	const articles = $("ul[class=m-listitem]").find("li").not(".m-listitem--ad");
	return {
		title: $("head title").text(),
		link: url,
		description: $("head meta[name=description]").attr("content"),
		language: "ja",
		item: articles.toArray().map((article) => {
			return {
				title: `${$("p.m-listitem__title span.subtitle", article).text()} ${$("p.m-listitem__title", article).contents().filter((_, el) => el.nodeType === 3).text()}`,
				author: $("p.m-listitem__author", article).text(),
				pubDate: timezone(parseDate($("span.date", article).text(), "YYYY-MM-DD"), 9),
				link: `${baseUrl}${$("a", article).attr("href")}`.replace(/\?summary$/, "")
			};
		})
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/atcoder/post.ts
const route = {
	path: "/post/:language?/:keyword?",
	categories: ["programming"],
	example: "/atcoder/post",
	parameters: {
		language: "Language, `jp` as Japanese or `en` as English, English by default",
		keyword: "Keyword"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Posts",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "en";
	const keyword = ctx.req.param("keyword") ?? "";
	const rootUrl = "https://atcoder.jp";
	const currentUrl = `${rootUrl}/posts?lang=${language}${keyword ? `&keyword=${keyword}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".panel").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".panel-title").text(),
			description: item.find(".panel-body").html(),
			link: `${rootUrl}${item.find(".panel-title a").attr("href")}`,
			pubDate: timezone(parseDate(item.find(".timeago").attr("datetime")), 9)
		};
	});
	return {
		title: `${keyword ? `[${keyword}] - ` : ""}${$("title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

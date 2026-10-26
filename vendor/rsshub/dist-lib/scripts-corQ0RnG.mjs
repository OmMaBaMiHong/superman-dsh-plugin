import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/greasyfork/scripts.ts
const route = {
	path: ["/:language/:domain?", "/scripts/sort/:sort/:language?"],
	categories: ["program-update"],
	example: "/greasyfork/en/google.com",
	parameters: {
		language: "language, located on the top right corner of Greasy Fork's search page, set to `all` for including all languages",
		domain: "the script's target domain"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["greasyfork.org/:language", "greasyfork.org/:language/scripts/by-site/:domain?"] }],
	name: "Script Update",
	maintainers: ["imlonghao", "miles170"],
	handler,
	description: `| Sort            | Description    |
| --------------- | -------------- |
| today           | Daily installs |
| total\\_installs | Total installs |
| ratings         | Ratings        |
| created         | Created date   |
| updated         | Updated date   |
| name            | Name           |`
};
async function handler(ctx) {
	const language = ctx.req.param("language") === "all" ? "zh-CN" : ctx.req.param("language") || "zh-CN";
	const domain = ctx.req.param("domain");
	const filter_locale = ctx.req.param("language") === "all" ? 0 : 1;
	const sort = ctx.req.param("sort") ?? "updated";
	const currentUrl = `https://greasyfork.org/${language}/scripts${domain ? `/by-site/${domain}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		searchParams: {
			filter_locale,
			sort
		}
	})).data);
	const list = $(".script-list").find("article");
	return {
		title: $("title").first().text(),
		link: currentUrl,
		description: $("meta[name=description]").attr("content"),
		item: list?.toArray().map((item) => {
			item = $(item);
			const h2 = item.find("h2");
			return {
				title: h2.find("a").text(),
				description: h2.find(".description").text(),
				link: new URL(h2.find("a").attr("href"), "https://greasyfork.org").href,
				pubDate: parseDate(item.find(".script-list-created-date relative-time").attr("datetime")),
				updated: parseDate(item.find(".script-list-updated-date relative-time").attr("datetime")),
				author: item.find(".script-list-author a").toArray().map((a) => $(a).text()).join(", ")
			};
		})
	};
}
//#endregion
export { route };

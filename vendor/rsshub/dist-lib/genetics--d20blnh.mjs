import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cas/genetics/index.ts
const baseUrl = "https://genetics.cas.cn";
const route = {
	path: "/genetics/:path{.+}",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const path = ctx.req.param("path");
	const currentUrl = `${baseUrl}/${path}/`;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items;
	if (path.slice(0, 3) === "edu") items = $("li.box-s.h16").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const date = item.find(".box-date").first();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(date.text(), "YYYY-MM-DD")
		};
	});
	else if (path.slice(0, 4) === "dqyd") items = $("div.list-tab ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const date = item.find(".right").first();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(date.text(), "YYYY-MM-DD")
		};
	});
	else items = $("li.row.no-gutters.py-1").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const date = item.find(".col-news-date").first();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(date.text(), "YYYY.MM.DD")
		};
	});
	return {
		title: $("head title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bnu/fdy.ts
const route = {
	path: "/fdy/:path{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const baseUrl = "http://fdy.bnu.edu.cn";
	const { path = "tzgg" } = ctx.req.param();
	const link = `${baseUrl}/${path}/index.htm`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".listconrl li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), link).href,
			pubDate: parseDate(item.find(".news-dates").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)(".listconrc-newszw").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		item: items
	};
}
//#endregion
export { route };

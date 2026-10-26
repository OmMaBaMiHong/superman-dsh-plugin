import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nenu/yjsy.ts
const route = {
	path: "/yjsy/*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const path = getSubPath(ctx) === "/yjsy" ? "/tzgg" : getSubPath(ctx).replace(/^\/yjsy/, "");
	const rootUrl = "https://yjsy.nenu.edu.cn";
	const currentUrl = `${rootUrl}${path}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("a.tit").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: link.startsWith("http") ? link : new URL(link, rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (/yjsy\.nenu\.edu\.cn/.test(item.link)) {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.title = content("h2").text();
			item.description = content(".v_news_content").html();
			item.pubDate = parseDate(content("h3").text().match(/(\d{4}-\d{2}-\d{2})/)[1]);
		}
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };

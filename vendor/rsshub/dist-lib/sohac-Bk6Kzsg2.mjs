import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nenu/sohac.ts
const route = {
	path: "/sohac/*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const path = getSubPath(ctx) === "/sohac" ? "/index/tzgg" : getSubPath(ctx).replace(/^\/sohac/, "");
	const rootUrl = "https://sohac.nenu.edu.cn";
	const currentUrl = `${rootUrl}${path}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("span.data").slice(0, limit).toArray().map((item) => {
		item = $(item).prev();
		return {
			title: item.text(),
			link: new URL(item.attr("href"), rootUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content(".biaoti").text();
		item.description = content(".v_news_content").html();
		item.pubDate = parseDate(content(".sj").text().match(/(\d{4}-\d{2}-\d{2})/)[1]);
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

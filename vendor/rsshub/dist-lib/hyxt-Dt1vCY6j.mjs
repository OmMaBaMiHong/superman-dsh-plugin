import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as processMeta, n as getMeta, r as processItems, t as domain } from "./util-CZlp6-V22.mjs";
import { load } from "cheerio";
//#region lib/routes/whu/hyxt.ts
const route = {
	path: "/hyxt/:category{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { category = "tzgg" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = `https://hyxt.${domain}`;
	const currentUrl = new URL(`${category}.htm`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("tr.content-title").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.find("td a");
		return {
			title: a.text(),
			link: new URL(a.prop("href"), rootUrl).href,
			pubDate: parseDate(item.find("td").last().text())
		};
	});
	items = await processItems(items, rootUrl);
	const meta = processMeta(response);
	const siteName = getMeta(meta, "SiteName");
	const columnName = getMeta(meta, "ColumnName");
	return {
		item: items,
		title: `${siteName} - ${columnName}`,
		link: currentUrl,
		description: getMeta(meta, "ColumnKeywords"),
		language: $("html").prop("lang"),
		image: new URL($("div.top-logo img").prop("src"), rootUrl).href,
		subtitle: columnName,
		author: siteName,
		allowEmpty: true
	};
}
//#endregion
export { route };

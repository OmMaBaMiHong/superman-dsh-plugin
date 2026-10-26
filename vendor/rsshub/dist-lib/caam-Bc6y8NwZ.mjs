import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/caam/index.ts
const route = {
	path: "/:category?",
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { category = "1" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "http://www.caam.org.cn";
	const currentUrl = new URL(`chn/1/cate_${category}/list_1.html`, rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("span.cont").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const a = item.parent();
		return {
			title: item.text(),
			link: new URL(a.prop("href"), currentUrl).href,
			pubDate: parseDate(a.find("span.time").text(), "[YYYY.MM.DD]")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		const infoEls = content("div.fourTop em");
		item.title = content("div.fourTop h2").text();
		item.description = content("div.fourBox").html();
		item.author = infoEls.length <= 1 ? void 0 : content("div.fourTop em").last().text();
		item.pubDate = parseDate(infoEls.first().text());
		return item;
	})));
	const author = $("div.footer a").first().text();
	const subtitle = $("div.topMeuns ul li a").last().text();
	const image = new URL("images/header-back-7.png", rootUrl).href;
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: $("meta[property=\"og:description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		subtitle,
		author
	};
}
//#endregion
export { route };

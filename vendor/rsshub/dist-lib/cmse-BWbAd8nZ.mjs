import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-B2ASvFKu.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/cmse/index.ts
async function handler(ctx) {
	const path = getSubPath(ctx).replaceAll(/(^\/cmse|\/$)/g, "");
	const currentUrl = `http://www.cmse.gov.cn${path === "" ? "/xwzx/zhxw/" : `${path}/`}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("#list li a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15).toArray().map((item) => {
		item = $(item);
		const pubDate = item.next().text();
		const link = new URL(item.attr("href"), currentUrl).href;
		return {
			title: item.text(),
			pubDate: parseDate(pubDate),
			link: link.endsWith(".html") ? link : `${link}#${pubDate}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".share").remove();
		const detailPubTimeMatches = detailResponse.data.match(/__\$pubtime='(.*?)';var/);
		item.pubDate = detailPubTimeMatches ? timezone(parseDate(detailPubTimeMatches[1]), 8) : item.pubDate;
		item.description = renderDescription({
			video: content("#con_video").html(),
			description: content(".TRS_Editor, #content").html()
		});
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { handler as t };

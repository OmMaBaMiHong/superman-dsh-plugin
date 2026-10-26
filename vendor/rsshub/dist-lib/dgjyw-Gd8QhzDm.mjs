import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/dgjyw/index.ts
const route = {
	path: "*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const params = getSubPath(ctx);
	const rootUrl = "https://www.dgjyw.com";
	const currentUrl = `${rootUrl}${params === "/" ? "/tz" : params}.htm`;
	const $ = load((await got_default(currentUrl)).data);
	let items = $("div.text-list ul li a").toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: `${link.startsWith("http") ? "" : `${rootUrl}/`}${link}`,
			pubDate: parseDate(item.next().text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (/dgjyw\.com/.test(item.link)) {
			const content = load((await got_default(item.link)).data);
			content(".cont-tit").remove();
			content(".art-body").html(content(".v_news_content").html());
			item.pubDate = timezone(parseDate(content("meta[name=\"PubDate\"]").attr("content")), 8);
			item.description = content("form[name=\"_newscontent_fromname\"]").html();
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

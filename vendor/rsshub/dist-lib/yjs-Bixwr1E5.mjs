import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/yjs.ts
const route = {
	path: "/yjs/*",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://yjs.nuist.edu.cn/${getSubPath(ctx) === "/yjs/" ? "index/tzgg" : getSubPath(ctx).replace(/^\/yjs\//, "")}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".gridlinediv").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").last();
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(item.next().text(), "YYYY年MM月DD日")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const timeMatches = content(".bar").text().match(/(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/);
		item.description = content(".v_news_content").html();
		item.pubDate = timeMatches ? timezone(parseDate(timeMatches[1], "YYYY年MM月DD日 HH:mm"), 8) : item.pubDate;
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

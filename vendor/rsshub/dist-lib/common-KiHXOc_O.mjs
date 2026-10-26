import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cnbeta/utils.ts
const rootUrl = "https://www.cnbeta.com.tw";
const ProcessItems = (items, limit) => Promise.all(items.slice(0, limit ? Number.parseInt(limit) : 60).map((item) => cache_default.tryGet(item.link, async () => {
	const content = load((await got_default(item.link)).data);
	content(".topic, .article-topic, .article-global").remove();
	item.description = content(".article-summary").html() + content(".article-content").html();
	item.author = content("header.title div.meta span.source").text();
	item.pubDate ??= timezone(parseDate(content(".meta span").first().text(), "YYYY年MM月DD日 HH:mm"), 8);
	return item;
})));
//#endregion
//#region lib/routes/cnbeta/common.ts
async function handler(ctx) {
	const { type, id } = ctx.req.param();
	const currentUrl = type ? `${rootUrl}/${type}/${id}.htm` : rootUrl;
	let response = await got_default(currentUrl);
	const $ = load(response.data);
	const token = encodeURI($("meta[name=\"csrf-token\"]").attr("content"));
	response = await got_default(`${rootUrl}/home/more?&type=${$("div[data-type]").data("type")}&page=1&_csrf=${token}&_=${Date.now()}`);
	const items = type ? response.data.result.list.map((item) => ({
		title: item.title,
		description: item.hometext,
		author: item.source.split("@http", 1)[0],
		pubDate: timezone(parseDate(item.inputtime), 8),
		link: item.url_show.startsWith("//") ? `https:${item.url_show}` : item.url_show.replace("http:", "https:"),
		category: item.label.name
	})) : response.data.result.map((item) => ({
		title: item.title,
		link: item.url_show.startsWith("//") ? `https:${item.url_show}` : item.url_show.replace("http:", "https:"),
		category: item.label.name
	}));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: await ProcessItems(items, ctx.req.query("limit"))
	};
}
//#endregion
export { handler as t };

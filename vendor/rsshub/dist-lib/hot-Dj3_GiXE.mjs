import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gamer/hot.ts
const route = {
	path: "/hot/:bsn",
	categories: ["anime"],
	view: 0,
	example: "/gamer/hot/47157",
	parameters: { bsn: "板塊 id，在 URL 可以找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "本板推薦",
	maintainers: [
		"nczitzk",
		"TonyRL",
		"kennyfong19931"
	],
	handler
};
async function handler(ctx) {
	const rootUrl = `https://forum.gamer.com.tw/B.php?bsn=${ctx.req.param("bsn")}`;
	const $ = load((await got_default({
		url: rootUrl,
		headers: { Referer: "https://forum.gamer.com.tw" }
	})).data);
	const list = $("div.popular__card-list div.popular__card-img a").toArray().map((item) => {
		item = $(item);
		return { link: item.attr("href") };
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			url: item.link,
			headers: { Referer: rootUrl }
		})).data);
		content("div.c-post__body__buttonbar").remove();
		item.title = content(".c-post__header__title").text();
		item.description = content("div.c-post__body").html();
		item.author = `${content("a.username").eq(0).text()} (${content("a.userid").eq(0).text()})`;
		item.pubDate = timezone(parseDate(content("a.edittime").eq(0).attr("data-mtime"), 8));
		return item;
	})));
	const ret = {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
	ctx.set("json", ret);
	return ret;
}
//#endregion
export { route };

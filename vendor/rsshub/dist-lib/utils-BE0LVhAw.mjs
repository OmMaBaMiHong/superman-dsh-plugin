import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/guokr/utils.ts
const parseList = (result) => result.map((item) => ({
	title: item.title,
	description: item.summary,
	pubDate: parseDate(item.date_published),
	link: `https://www.guokr.com/article/${item.id}/`,
	author: item.author.nickname,
	category: item.subject?.name,
	id: item.id,
	channels: item.channels
}));
const parseItem = (item) => cache_default.tryGet(item.link, async () => {
	const { data: res } = await got_default(`https://apis.guokr.com/minisite/article/${item.id}.json`);
	const $ = cheerio.load(res.result.content);
	$("#meta_content").remove();
	$("div").each((_, elem) => {
		const $elem = $(elem);
		$elem.attr("style", $elem.attr("style")?.replaceAll(/(?:display:\s*none|visibility:\s*hidden|opacity:\s*0);?/g, ""));
	});
	$("img").each((_, elem) => {
		const $elem = $(elem);
		if ($elem.attr("data-src")) $elem.attr("src", $elem.attr("data-src"));
	});
	item.description = $.html();
	return item;
});
//#endregion
export { parseList as n, parseItem as t };

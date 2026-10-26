import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/leiphone/utils.ts
const ProcessFeed = async (list, cache) => {
	const host = "https://www.leiphone.com";
	return await Promise.all(list.map(async (e) => {
		const link = new URL(e, host).href;
		return await cache.tryGet(link, async () => {
			const $ = load((await got_default.get(link)).data);
			let description = "";
			if ($(".top-img").html() !== null) description += $(".top-img").html();
			return {
				title: $(".headTit").text(),
				description: description + $(".article-lead").text() + $(".lph-article-comView").html(),
				pubDate: parseDate($(".time").text(), 8),
				author: $(".aut > a").text(),
				link
			};
		});
	}));
};
var utils_default = { ProcessFeed };
//#endregion
export { utils_default as t };

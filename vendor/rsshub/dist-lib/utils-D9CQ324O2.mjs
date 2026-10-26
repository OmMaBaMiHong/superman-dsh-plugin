import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/dapenti/utils.ts
var utils_default = { parseFeed: async ({ subjectid }) => {
	const url = `https://www.dapenti.com/blog/blog.asp?name=xilei&subjectid=${subjectid}`;
	const listRes = await got_default({
		method: "get",
		url,
		headers: { Referer: url },
		responseType: "buffer"
	});
	const $ = load(iconv.decode(listRes.data, "gb2312"));
	const list = $("li", "ul").slice(0, 3).toArray();
	const result_item = await Promise.all(list.map((item) => cache_default.tryGet(`https://www.dapenti.com/blog/${$(item).find("a").attr("href")}`, async () => {
		const el = $(item);
		const url = `https://www.dapenti.com/blog/${el.find("a").attr("href")}`;
		const original_data = await got_default({
			method: "get",
			url,
			headers: { Referer: url },
			responseType: "buffer"
		});
		const description = load(iconv.decode(original_data.data, "gbk"), { decodeEntities: false })("body > table > tbody > tr > td.oblog_t_2 > div > table > tbody > tr:nth-child(2) > td");
		const pubInfo = description.find("span span.oblog_text").text().split("发布于");
		description.find("table, .adsbygoogle").remove();
		const count = subjectid.toString() === "70" ? 7 : 3;
		for (let index = 0; index < count; index++) description.children().first().remove();
		for (let index = 0; index < 8; index++) description.children().last().remove();
		return {
			title: el.text(),
			author: pubInfo[0].trim(),
			description: description.html(),
			pubDate: timezone(parseDate(pubInfo[1]?.trim()), 8),
			link: url
		};
	})));
	return {
		title: `喷嚏-${subjectid}`,
		link: url,
		item: result_item
	};
} };
//#endregion
export { utils_default as t };

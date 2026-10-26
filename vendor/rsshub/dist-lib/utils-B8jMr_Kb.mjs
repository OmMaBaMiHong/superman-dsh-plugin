import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/pingwest/utils.ts
const modifiedLink = (link) => link.startsWith("http") ? link : `https:${link}`;
const statusListParser = ($) => {
	return $(".item").toArray().map((ele) => {
		const timestamp = ele.attribs.pt;
		const mainNode = load(ele)(".news-detail");
		const imgsStr = mainNode.find("img").toArray().map((ele) => `<img src="${ele.attribs.src.split("?x-", 1)[0]}">`).join("<br>");
		const link = mainNode.find(".content a").first().attr("href");
		const content = mainNode.text().trim().replace(/展开全文$/, "");
		return {
			title: content,
			link: link.startsWith("http") ? link : `https:${link}`,
			description: [content, imgsStr].filter((s) => !!s).join("<br>"),
			pubDate: (/* @__PURE__ */ new Date(timestamp * 1e3)).toUTCString()
		};
	});
};
const articleListParser = async ($, needFullText, cache) => {
	return await Promise.all($(".item").toArray().map(async (ele) => {
		const $item = load(ele);
		let titleNode, authorNode;
		if ($item(".news-detail").children().length <= 2) {
			titleNode = $item(".news-detail .content .text");
			authorNode = $item(".news-detail .content .op");
		} else {
			titleNode = $item(".news-detail .title");
			authorNode = $item(".news-detail .author");
		}
		const title = titleNode.find("a").text();
		const prefixUrl = titleNode.find("a").attr("href");
		const link = modifiedLink(prefixUrl);
		const imgUrl = $item(".news-img img")?.attr("src")?.split("?x-", 1)[0];
		const author = authorNode.children().first().text();
		const timestamp = authorNode.find(".time").text();
		const date = /小时前/.test(timestamp) ? parseRelativeDate(timestamp) : parseDate(timestamp, ["YYYY M D", "M D"]);
		let description = $item(".desc").text();
		const shortText = imgUrl ? `<br><img src="${imgUrl}">` : "";
		description += needFullText ? await getFullArticle(link, cache) : shortText;
		return {
			title,
			link,
			description,
			author,
			pubDate: timezone(date, 8)
		};
	}));
};
const getFullArticle = (link, cache) => cache.tryGet(link, async () => {
	const { data } = await got_default(link);
	const $ = load(data);
	$("img").each((_, ele) => {
		if (ele.attribs.src.includes("?x-")) ele.attribs.src = ele.attribs.src.split("?x-", 1)[0];
	});
	return $("section .article-style").html();
});
var utils_default = {
	articleListParser,
	statusListParser
};
//#endregion
export { utils_default as t };

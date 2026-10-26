import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gamersky/utils.ts
const getArticleList = async (nodeId) => {
	return (await rofetch(`https://db2.gamersky.com/LabelJsonpAjax.aspx?${new URLSearchParams({ jsondata: JSON.stringify({
		type: "updatenodelabel",
		isCache: true,
		cacheTime: 60,
		nodeId,
		isNodeId: "true",
		page: 1
	}) })}`, { parseResponse: (txt) => JSON.parse(txt.match(/\((.+)\);/)?.[1] ?? "{}") })).body;
};
const parseArticleList = (response) => {
	const $ = load(response);
	return $("li").toArray().map((item) => {
		const ele = $(item);
		const a = ele.find(".tt").length ? ele.find(".tt") : ele.find("a");
		const title = a.text();
		const link = a.attr("href");
		const pubDate = timezone(parseDate(ele.find(".time").text()), 8);
		const description = ele.find(".txt").text();
		if (!link) return;
		return {
			title,
			link,
			pubDate,
			description
		};
	}).filter((item) => item !== void 0);
};
const getArticle = (item) => cache_default.tryGet(item.link, async () => {
	const content = load(await rofetch(item.link))(".Mid2L_con, .MidLcon");
	content.find(".appGameBuyCardIframe, .GSAppButton, .Mid2L_down").remove();
	content.find("a").each((_, item) => {
		if (item.attribs.href?.startsWith("https://www.gamersky.com/showimage/id_gamersky.shtml?")) item.attribs.href = item.attribs.href.replace("https://www.gamersky.com/showimage/id_gamersky.shtml?", "");
	});
	content.find("img").each((_, item) => {
		if (item.attribs.src === "http://image.gamersky.com/webimg13/zhuanti/common/blank.png") item.attribs.src = item.attribs["data-origin"];
		else if (item.attribs.src.endsWith("_S.jpg")) item.attribs.src = item.attribs.src.replace("_S.jpg", ".jpg");
	});
	content.find(".Slides li").each((_, item) => {
		if (item.attribs.style === "display: none;") item.attribs.style = "display: list-item;";
	});
	item.description = content.html() || item.description;
	return item;
});
const getUserArticleList = async (userId) => {
	return (await rofetch(`https://i.gamersky.com/u/api/v2/GetUserContent?${new URLSearchParams({ jsondata: JSON.stringify({
		pageIndex: 1,
		pageSize: 20,
		userId
	}) })}`, { parseResponse: (txt) => JSON.parse(txt.slice(1, -2)) })).body;
};
const parseUserArticleList = (body) => {
	const $ = load(body);
	const list = $(".cmt-list");
	const info = list.find(".uname").first();
	return {
		uname: info.text(),
		link: info.attr("href"),
		list: list.toArray().map((item) => {
			const e = $(item);
			const title = e.find(".qzcmt-content-tit a");
			return {
				title: title.text(),
				link: title.attr("href"),
				pubDate: parseDate(e.attr("data-time")),
				description: e.find(".qzcmt-content-txt span").text()
			};
		})
	};
};
const getUserArticle = (item) => cache_default.tryGet(item.link, async () => {
	item.description = load(await rofetch(item.link))(".qzcmt-content-txt").html() || item.description;
	return item;
});
function mdTableBuilder(data) {
	return "|" + data.map((item) => `${item.type}|`).join("") + "\n|" + Array.from({ length: data.length }, () => "---|").join("") + "\n|" + data.map((item) => `${item.name}|`).join("") + "\n";
}
//#endregion
export { mdTableBuilder as a, getUserArticleList as i, getArticleList as n, parseArticleList as o, getUserArticle as r, parseUserArticleList as s, getArticle as t };

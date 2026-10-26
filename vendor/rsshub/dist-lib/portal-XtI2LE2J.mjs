import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/chiphell/portal.ts
const handler = async (ctx) => {
	const { catId = "1" } = ctx.req.param();
	const url = `https://www.chiphell.com/portal.php?mod=list&catid=${catId}`;
	const response = await rofetch(url);
	const $ = cheerio.load(response);
	const list = $("dl.cl").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("a.xi2");
		return {
			title: a.text(),
			link: `https://www.chiphell.com/${a.attr("href")}`,
			category: [$item.find("dd label").text()],
			pubDate: timezone(parseDate($item.find("span.xg1").text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		const $ = cheerio.load(response);
		$("#article_content div br").parent().remove();
		let description = $("#article_content").html();
		if ($(".pg").length) {
			const urls = $(".pg a").toArray().map((item) => {
				return `https://www.chiphell.com/${$(item).attr("href")}`;
			}).slice(0, -1);
			const contents = (await Promise.all(urls.map((url) => rofetch(url)))).map((item) => cheerio.load(item)).map(($item) => {
				$item("#article_content div br").parent().remove();
				return $item("#article_content").html();
			});
			description = [description, ...contents].join("");
		}
		item.description = description;
		return item;
	})));
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link: url,
		item: items
	};
};
const route = {
	path: "/portal/:catId?",
	name: "分类",
	categories: ["bbs"],
	example: "/chiphell/portal/1",
	parameters: { catId: "分类 ID，可在 URL 中找到，默认为 1" },
	maintainers: ["tylinux"],
	handler
};
//#endregion
export { route };

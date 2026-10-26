import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/psnine/index.ts
const handler = async () => {
	const url = "https://www.psnine.com/";
	const response = await rofetch(url);
	const $ = cheerio.load(response);
	const out = $(".list li").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".title").text(),
			link: $item.find(".title a").attr("href"),
			pubDate: parseRelativeDate($item.find(".meta").contents().filter((_, i) => i.nodeType === 3).text().trim().split(/\s{2,}/, 1)[0]),
			author: $item.find(".meta a.psnnode").text(),
			category: $item.find(".meta a.node").toArray().map((a) => $(a).text())
		};
	});
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		image: `${url}/View/aimage/p9.png`,
		link: url,
		item: out
	};
};
const route = {
	path: "/",
	categories: ["game"],
	example: "/psnine",
	name: "首页",
	maintainers: ["betta-cyber"],
	handler,
	radar: [{ source: ["psnine.com"] }]
};
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/psnine/shuzhe.ts
const handler = async () => {
	const response = await rofetch("https://www.psnine.com/dd");
	const $ = cheerio.load(response);
	const out = $(".dd_ul li").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".dd_title").text(),
			link: $item.find(".dd_title a").attr("href"),
			description: $item.find(".dd_status").text(),
			author: $item.find(".meta a").text()
		};
	});
	return {
		title: $("head title").text(),
		link: "https://www.psnine.com/",
		item: out
	};
};
const route = {
	path: "/shuzhe",
	categories: ["game"],
	example: "/psnine/shuzhe",
	name: "数折",
	maintainers: ["betta-cyber"],
	handler,
	radar: [{ source: ["psnine.com/dd", "psnine.com"] }]
};
//#endregion
export { route };

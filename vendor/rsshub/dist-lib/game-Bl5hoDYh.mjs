import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/psnine/game.ts
const handler = async () => {
	const url = "https://www.psnine.com/psngame";
	const response = await rofetch(url);
	const $ = cheerio.load(response);
	const out = $("table tr").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find(".title a").text(),
			link: $item.find(".title a").attr("href"),
			description: $item.find(".title span").text() + " " + $item.find(".twoge").text()
		};
	});
	return {
		title: $("head title").text(),
		link: url,
		item: out
	};
};
const route = {
	path: "/game",
	categories: ["game"],
	example: "/psnine/game",
	name: "游戏",
	maintainers: ["betta-cyber"],
	handler,
	radar: [{ source: ["psnine.com/psngame", "psnine.com"] }]
};
//#endregion
export { route };

import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/air-level/index.ts
const route = {
	path: "/air/:area",
	radar: [{
		source: ["m.air-level.com/air/:area/"],
		target: "/air/:area"
	}],
	parameters: { area: "地区" },
	name: "空气质量",
	maintainers: ["lifetraveler"],
	example: "/air-level/air/xian",
	handler
};
async function handler(ctx) {
	const currentUrl = `https://m.air-level.com/air/${ctx.req.param("area")}`;
	const $ = load(await rofetch(currentUrl));
	const title = $("body > div.container > div.row.page > div:nth-child(1) > h2").text().replaceAll("[]", "");
	const table = $("body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > table");
	const qt = $("body > div.container > div.row.page > div:nth-child(1) > div.aqi-dv > div > span.aqi-bg.aqi-level-2").text();
	const pubtime = $("body > div.container > div.row.page > div:nth-child(1) > div.aqi-dv > div > span.label.label-info").text();
	return {
		title,
		item: [{
			title: title + " " + qt + " " + pubtime,
			link: currentUrl,
			description: `<table border="1 solid black">${table.html()}</table>`,
			guid: pubtime
		}],
		description: "订阅每个城市的天气质量",
		link: currentUrl
	};
}
//#endregion
export { route };

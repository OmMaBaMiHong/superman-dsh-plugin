import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/binance/launchpool.ts
const route = {
	path: "/launchpool",
	categories: ["finance"],
	example: "/binance/launchpool",
	radar: [{ source: ["binance.com/:lang/support/announcement"] }],
	name: "Binance数字货币及交易对上新",
	maintainers: ["zhenlohuang"],
	handler
};
async function handler() {
	const baseUrl = "https://www.binance.com/zh-CN/support/announcement";
	const url = `${baseUrl}/数字货币及交易对上新?c=48&navId=48`;
	const $ = load((await got_default({
		url,
		headers: { Referer: "https://www.binance.com/" }
	})).data);
	return {
		title: "Binance | 数字货币及交易对上新",
		link: url,
		description: "数字货币及交易对上新",
		item: JSON.parse($("#__APP_DATA").text()).appState.loader.dataByRouteId.d969.catalogs.find((catalog) => catalog.catalogId === 48).articles.filter((article) => article.title.includes("币安新币挖矿上线")).map((item) => ({
			title: item.title,
			link: `${baseUrl}/${item.code}`,
			description: item.title,
			pubDate: parseDate(item.releaseDate)
		}))
	};
}
//#endregion
export { route };
